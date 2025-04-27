import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import "../../components/style.css";
import "../../components/interviewschedueler.css";
import InterviewPopup from "./InterviewPopup";
import { useGoogleLogin } from '@react-oauth/google';


const ViewApplicants = () => {
    const { id: jobId } = useParams(); 
    console.log("Job ID from URL:", jobId);
    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;
    const [applicants, setApplicants] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [showInterviewPopup, setShowInterviewPopup] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const location = useLocation();
    const job = location.state  || {};
    const [showOfferSuccess, setShowOfferSuccess] = useState(false);
    const [offerDetails, setOfferDetails] = useState({ jobTitle: '', applicantName: '' });
    const [showRejectSuccess, setShowRejectSuccess] = useState(false);
    const [showMatchScore, setShowMatchScore] = useState(false);
    const [showReconnectPopup, setShowReconnectPopup] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const GOOGLE_CLIENT_ID = "714625690444-bjnr3aumebso58niqna7613rtvmc5e6f.apps.googleusercontent.com"
    const GOOGLE_CLIENT_SECRET = "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"
    const [matchScoreDetails, setMatchScoreDetails] = useState({
    applicantName: '',
    score: 0,
    explanation: ''
    });
    const [rejectDetails, setRejectDetails] = useState({
    applicantName: ''
    });


    const connectCalendar = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        try {
          const user = auth.currentUser;
          if (!user) throw new Error('Not authenticated');
    
          console.log("Google OAuth Response:", tokenResponse);
  
          const tokenResponseWithRefresh = await fetch(
            'https://oauth2.googleapis.com/token',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                code: tokenResponse.code, 
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: 'http://localhost:3000', 
                grant_type: 'authorization_code',
              }),
            }
          ).then(res => res.json());
    
          const payload = {
            uid: user.uid,
            token: tokenResponseWithRefresh.access_token,
            refreshToken: tokenResponseWithRefresh.refresh_token
          };
          console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
          
          const response = await fetch('http://localhost:5000/store-google-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': await user.getIdToken()
            },
            body: JSON.stringify(payload) 
          });
    
          const responseClone = response.clone();
          const data = await response.json();
          
          if (!response.ok) {
            throw { 
              message: data.error || 'Failed to store token',
              response: responseClone
            };
          }
    
          alert('Google Calendar connected successfully!');
        } catch (error) {
          console.error('Full error:', error);
          
          let errorDetails = '';
          try {
            const errorResponse = error.response || await fetch(error.url);
            errorDetails = await errorResponse.text();
          } catch (e) {
            errorDetails = error.message;
          }
          
          console.error('Error details:', errorDetails);
          alert(`Connection failed: ${error.message}\nDetails: ${errorDetails.substring(0, 100)}`);
        }
      },
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      flow: 'auth-code',
      prompt: 'consent',
      access_type: 'offline',
    });
  


        const fetchApplicants = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    throw new Error("User not authenticated");
                }

                const idToken = await user.getIdToken();
                console.log("job id" + jobId)

                const response = await fetch(`http://localhost:5000/fetch-applicants/${user.uid}/${jobId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": idToken,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch applicants");
                }

                const data = await response.json();
                console.log("Fetched Data:", data);
                setApplicants(data.applicants);
            } catch (error) {
                console.error("Error fetching applicants:", error);
                setError(error.message); 
            } finally {
                setLoading(false); 
            }
        };

    useEffect(() => {
        fetchApplicants()
    },
        [jobId]
)

        const fetchInterviewApplicants = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            const idToken = await user.getIdToken();

            const response = await fetch(`http://localhost:5000/fetch-collection-applicants/${user.uid}/${jobId}/interviewapplicants`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": idToken,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch interview applicants");
            }

            const data = await response.json();
            setApplicants(data.applicants);
        } catch (error) {
            console.error("Error fetching interview applicants:", error);
            setError(error.message);
        }
    };

    const fetchRejectedApplicants = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            const idToken = await user.getIdToken();

            const response = await fetch(`http://localhost:5000/fetch-collection-applicants/${user.uid}/${jobId}/rejectedapplicants`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": idToken,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch rejected applicants");
            }

            const data = await response.json();
            setApplicants(data.applicants);
        } catch (error) {
            console.error("Error fetching rejected applicants:", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (filter === "All") {
            fetchApplicants();
        } else if (filter === "Interview") {
            fetchInterviewApplicants();
        } else if (filter === "Rejected") {
            fetchRejectedApplicants();
        } else if (filter === "Offered") {
            fetchOfferedApplicants();}
    }, [filter, jobId]);

    const fetchOfferedApplicants = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            const idToken = await user.getIdToken();

            const response = await fetch(`http://localhost:5000/fetch-collection-applicants/${user.uid}/${jobId}/offeredapplicants`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": idToken,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch interview applicants");
            }

            const data = await response.json();
            setApplicants(data.applicants);
        } catch (error) {
            console.error("Error fetching interview applicants:", error);
            setError(error.message);
        }
    };


    const handleInterviewClick = (applicant) => {
        console.log("Setting applicant:", applicant);
        setSelectedApplicant(applicant);
        setShowInterviewPopup(true);
      };

      const handleInterview = async (applicantId) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            const idToken = await user.getIdToken();

            const response = await fetch(`http://localhost:5000/interview-applicants/${user.uid}/${jobId}?applicant_id=${applicantId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": idToken,
                },
            });

            const responseData = await response.json();

                    
            if (!response.ok) {
              if (responseData.error === 'invalid_scope' || responseData.code === 'CALENDAR_NEEDS_RECONNECT') {
                setShowReconnectPopup(true);
                return;
              }
              throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }


            const data = await response.json();
            console.log("Interview Response:", data);


            if (filter === "All") {
                await fetchApplicants();
            } else if (filter === "Interview") {
                await fetchInterviewApplicants();
            } else if (filter === "Rejected") {
                await fetchRejectedApplicants();
            } else if (filter === "Offered") {
                await fetchOfferedApplicants();}

            alert("Applicant added to interview list");
        } catch (error) {
            console.error("Error adding applicant to interview list:", error);
        }
    };

    const handleScheduleInterview = async (interviewDetails) => {
        try {

            if (!selectedApplicant || !selectedApplicant.uid) {
                throw new Error("No applicant selected");
              }

              await handleInterview(selectedApplicant.uid, jobId);
          
              console.log("Scheduling interview for:", selectedApplicant.uid);
              console.log(jobId)

          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");
      
          const idToken = await user.getIdToken();

          const payload = {
            date: interviewDetails.date.toISOString(),
            type: interviewDetails.type,
            notes: interviewDetails.notes,
            applicantEmail: selectedApplicant.email,
            jobTitle: jobId || "the position",
          };

          console.log(payload)
          console.log(selectedApplicant.uid)
    
          const response = await fetch(
            `http://localhost:5000/schedule-interview/${user.uid}/${jobId}/${selectedApplicant.uid}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: idToken,
              },
              body: JSON.stringify({
                date: interviewDetails.date.toISOString(),
                type: interviewDetails.type,
                notes: interviewDetails.notes,
                applicantEmail: selectedApplicant.email,
                jobTitle: jobId || 'this position', 
              }),
            }
          );
      
          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error === 'invalid_scope') {
              setShowReconnectPopup(true);
              return;
            }
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
    
      
          alert("Interview scheduled successfully!");
          setShowInterviewPopup(false);
        } catch (error) {
          console.error("Error scheduling interview:", error);
          alert("Error scheduling interview: " + error.message);
        }

        if (filter === "All") await fetchApplicants();
        else if (filter === "Interview") await fetchInterviewApplicants();
      };

      const handleReject = async (applicantId) => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");
      
          const idToken = await user.getIdToken();
          const response = await fetch(
            `http://localhost:5000/rejected-applicants/${user.uid}/${jobId}?applicant_id=${applicantId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": idToken,
              },
            }
          );
      
          if (!response.ok) throw new Error("Failed to reject applicant");
      
          const applicant = applicants.find(app => app.uid === applicantId);
          setRejectDetails({
            applicantName: applicant ? `${applicant.first_name} ${applicant.last_name}` : "the applicant"
          });
          
          setShowRejectSuccess(true);
      
          if (filter === "All") await fetchApplicants();
          else if (filter === "Interview") await fetchInterviewApplicants();
          else if (filter === "Rejected") await fetchRejectedApplicants();
          else if (filter === "Offered") await fetchOfferedApplicants();
      
        } catch (error) {
          console.error("Error rejecting applicant:", error);
          alert("Error rejecting applicant: " + error.message);
        }
      };

    const handleOffer = async (applicantId) => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");
      
          const idToken = await user.getIdToken();

          const offerResponse = await fetch(
            `http://localhost:5000/offer-applicants/${user.uid}/${jobId}?applicant_id=${applicantId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': idToken,
              },
            }
          );
      
          const offerData = await offerResponse.json();
          if (!offerResponse.ok) {
            throw new Error(offerData.error || 'Failed to update offer lists');
          }
          const response = await fetch(
            `http://localhost:5000/send_job_offer/${user.uid}/${jobId}/${applicantId}`, {
            method: "POST",
            headers: {
              "Authorization": idToken,
              "Content-Type": "application/json",
            },
          });
      
          if (!response.ok) throw new Error("Failed to send offer");
          
          const data = await response.json();
          
          const applicant = applicants.find(app => app.uid === applicantId);
          setOfferDetails({
            jobTitle: jobId,
            applicantName: applicant ? `${applicant.first_name} ${applicant.last_name}` : "the applicant"
          });
          
          setShowOfferSuccess(true);
          
          if (filter === "All") await fetchApplicants();
          else if (filter === "Interview") await fetchInterviewApplicants();
          else if (filter === "Rejected") await fetchRejectedApplicants();
          else if (filter === "Offered") await fetchOfferedApplicants();
      
        } catch (error) {
          console.error("Error offering job:", error);
          alert("Error offering job: " + error.message);
        }
      };

      const handleMatchScore = async (applicantId, jobId) => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");
      
          const idToken = await user.getIdToken();
          const response = await fetch(
            `http://localhost:5000/matchscore-applicants/${user.uid}/${jobId}?applicant_id=${applicantId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": idToken,
              },
            }
          );
      
          if (!response.ok) throw new Error("Failed to fetch match score");
      
          const data = await response.json();
          console.log(data)
          if (data.success) {
            const applicant = applicants.find(app => app.uid === applicantId);

            const scoreBreakdown = data.score_breakdown ? 
        Object.entries(data.score_breakdown)
        .map(([key, value]) => `${key}: ${value}`)
          .join('<br>') 
        : "No detailed breakdown available";

            setMatchScoreDetails({
              applicantName: applicant ? `${applicant.first_name} ${applicant.last_name}` : "the applicant",
              score: data.match_score.toFixed(2) * 100,
              explanation_title:`<strong>Match score breakdown: </strong><br> `,
              explanation: `${scoreBreakdown}`,
            });
            setShowMatchScore(true);
          } else {
            throw new Error(data.error || "Unknown error");
          }
        } catch (error) {
          console.error("Error fetching match score:", error);
          alert("Error fetching match score: " + error.message);
        }
      };
    

    const handleChat = (applicantId) => {
        navigate(`/recruiterchat/${applicantId}`);
    };

    const viewCV = async (applicantId) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return alert("Please sign in to view CVs.");
    
            const idToken = await user.getIdToken();
    
            const response = await fetch(`http://127.0.0.1:5000/fetch-applicant-pdf/${applicantId}`, {
                method: "GET",
                headers: { Authorization: idToken },
            });
    
            if (!response.ok) {
                throw new Error(response.status === 404 ? "Applicant hasn't uploaded a CV" : "Could not fetch PDF");
            }
    
            const data = await response.json();
    
            if (data.fileData) {
                const byteCharacters = atob(data.fileData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });
    
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");
                URL.revokeObjectURL(blobUrl);
            } else {
                alert("No CV data found for this applicant");
            }
        } catch (error) {
            console.error("Error fetching CV:", error);
            alert(error.message);
        }
    };

    const InterviewPopup = ({ applicantName, jobTitle, onClose, onSchedule }) => {
        const [interviewDetails, setInterviewDetails] = useState({
          date: '',
          time: '',
          type: 'Video Call',
          notes: ''
        });
      
        const handleSubmit = (e) => {
          e.preventDefault();
          const dateTime = new Date(`${interviewDetails.date}T${interviewDetails.time}`);
          onSchedule({
            date: dateTime,
            type: interviewDetails.type,
            notes: interviewDetails.notes
          });
        };
      
        return (
          <div className="interview-modal-overlay">
            <div className="interview-modal">
              <div className="interview-modal-header">
                <h2>Schedule Interview with {applicantName}</h2>
                <button className="close-button" onClick={onClose}>×</button>
              </div>
              
              <div className="interview-modal-body">
                <div className="interview-info">
                  <p><strong>For:</strong> {jobTitle}</p>
                </div>

          (
            <button onClick={connectCalendar} className="connect-button">
              Connect Calendar
            </button>)
      
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      value={interviewDetails.date}
                      onChange={(e) => setInterviewDetails({...interviewDetails, date: e.target.value})}
                      required
                    />
                  </div>
      
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      value={interviewDetails.time}
                      onChange={(e) => setInterviewDetails({...interviewDetails, time: e.target.value})}
                      required
                    />
                  </div>
      
                  <div className="form-group">
                    <label>Interview Type</label>
                    <select
                      value={interviewDetails.type}
                      onChange={(e) => setInterviewDetails({...interviewDetails, type: e.target.value})}
                    >
                      <option value="Video Call">Video Call</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>
      
                  <div className="form-group">
                    <label>Notes/Special Instructions</label>
                    <textarea
                      value={interviewDetails.notes}
                      onChange={(e) => setInterviewDetails({...interviewDetails, notes: e.target.value})}
                      placeholder="Any special instructions for the candidate..."
                    />
                  </div>
      
                  <div className="interview-modal-footer">
                    <button type="button" className="cancel-button" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="schedule-button">
                      Schedule Interview
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      };
    

    return (
        <main className="view-applicants-container">
          <button className="back-button-view" onClick={() => navigate(-1)}>Go Back</button>
          <h1 className="view-applicants-title">Applicants for Job ID: {jobId}</h1>
      
          <label>Filter by Status</label>
          <div className="status-filter">
            {["All", "Interview", "Offered", "Rejected"].map(status => (
              <button 
                key={status} 
                className={`filter-button ${filter === status ? "selected" : ""}`} 
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
      
          <section className="applicant-list">
            {applicants.length > 0 ? (
              applicants.map(applicant => (
                <div key={applicant.id} className="applicant-card">
                  <h2 className="applicant-name">{applicant.first_name} {applicant.last_name}</h2>
                  <p className="applicant-email"><strong>Email:</strong> {applicant.email}</p>
                  <p className="applicant-location"><strong>Location:</strong> {applicant.location || "Not provided"}</p>
                  <p className="applicant-phone"><strong>Phone:</strong> {applicant.phone_number || "Not provided"}</p>
      
                  <div className="applicant-actions">
                    {filter === "Interview" && (
                      <button className="offer-button" onClick={() => handleOffer(applicant.uid)}>
                        Offer
                      </button>
                    )}
                    
                    {filter !== "Rejected" && filter !== "Offered" && filter !== "Interview" && (
                      <button className="interview-button" onClick={() => handleInterviewClick(applicant)}>
                        Interview
                      </button>
                    )}
        
                    <button className="match-score-button" onClick={() => handleMatchScore(applicant.uid, jobId)}>
                      Match Score
                    </button>
                    <button className="chat-button" onClick={() => handleChat(applicant.uid)}>
                      Chat
                    </button>
                    {filter !== "Rejected" && filter !== "Offered" && (
                      <button className="reject-button" onClick={() => handleReject(applicant.uid)}>
                        Reject
                      </button>
                    )}
      
                    <button className="view-cv-button" onClick={() => viewCV(applicant.uid)}>
                      View CV
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-applicants">No applicants found.</p>
            )}
          </section>
      
          {showInterviewPopup && selectedApplicant && (
            <InterviewPopup
              applicantName={`${selectedApplicant.first_name} ${selectedApplicant.last_name}`}
              jobTitle={jobId || "the position"}
              onClose={() => setShowInterviewPopup(false)}
              onSchedule={handleScheduleInterview}
            />
          )}

          {/* Reject Confirmation Modal */}
          {showRejectSuccess && (
            <div className="confirmation-modal">
              <div className="confirmation-content">
                <h2>Applicant Rejected</h2>
                <p className="confirmation-message">
                  You've rejected <strong>{rejectDetails.applicantName}</strong> for this position.
                </p>
                <div className="confirmation-buttons">
                  <button 
                    className="confirm-button reject-btn" 
                    onClick={() => setShowRejectSuccess(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Match Score Modal */}
          {showMatchScore && (
            <div className="confirmation-modal">
              <div className="confirmation-content">
                <h2>Match Score Details</h2>
                <div className="match-score-display">
                  <div className="score-circle">
                    {matchScoreDetails.score}%
                  </div>
                  <h3>{matchScoreDetails.applicantName}</h3>
                  <p className="score-explanation">
                  <div dangerouslySetInnerHTML={{ __html: matchScoreDetails.explanation_title }} />
                  <div style={{ textAlign: 'left' }}>
                      <div dangerouslySetInnerHTML={{ __html: matchScoreDetails.explanation }} />
                  </div>
                  </p>
                </div>
                <div className="confirmation-buttons">
                  <button 
                    className="confirm-button" 
                    onClick={() => setShowMatchScore(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
      
          {showOfferSuccess && (
            <div className="confirmation-modal">
              <div className="confirmation-content">
                <h2>Offer Sent Successfully!</h2>
                <p className="confirmation-message">
                  You've offered <strong>{offerDetails.applicantName}</strong> the position of:
                  <br />
                  <strong className="job-title-highlight">{offerDetails.jobTitle}</strong>
                </p>
                <div className="confirmation-buttons">
                  <button 
                    className="confirm-button" 
                    onClick={() => setShowOfferSuccess(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      );
    }

export default ViewApplicants;