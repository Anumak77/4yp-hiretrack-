import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import "../../components/style.css";
import "../../components/interviewschedueler.css";
import InterviewPopup from "./InterviewPopup";

const ViewApplicants = () => {
    const { id: jobId } = useParams(); 
    console.log("Job ID from URL:", jobId);
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [showInterviewPopup, setShowInterviewPopup] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const location = useLocation();
    const job = location.state  || {};


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

            const response = await fetch(`http://localhost:5000/fetch-interview-applicants/${user.uid}/${jobId}`, {
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

            const response = await fetch(`http://localhost:5000/fetch-rejected-applicants/${user.uid}/${jobId}`, {
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

            const response = await fetch(`http://localhost:5000/fetch-offered-applicants/${user.uid}/${jobId}`, {
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


    const handleInterview = (applicant) => {
        setSelectedApplicant(applicant);
        setShowInterviewPopup(true);
      };

    const MarkAsInterview = async (applicantId) => {
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

            if (!response.ok) {
                throw new Error("Failed to add applicant to interview list");
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

            console.log(selectedApplicant.uid)

          await MarkAsInterview(selectedApplicant.uid);
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");
      
          const idToken = await user.getIdToken();
    
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
                jobTitle: job.Title, 
              }),
            }
          );
      
          if (!response.ok) throw new Error("Failed to schedule interview");
      
          await handleInterview(selectedApplicant.uid);
      
          alert("Interview scheduled successfully!");
          setShowInterviewPopup(false);
        } catch (error) {
          console.error("Error scheduling interview:", error);
          alert("Error scheduling interview: " + error.message);
        }
      };

    const handleReject = async (applicantId) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            const idToken = await user.getIdToken();

            const response = await fetch(`http://localhost:5000/rejected-applicants/${user.uid}/${jobId}?applicant_id=${applicantId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": idToken,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to add applicant to rejected list");
            }

            const data = await response.json();
            console.log("Reject Response:", data);

            
            if (filter === "All") {
                await fetchApplicants();
            } else if (filter === "Interview") {
                await fetchInterviewApplicants();
            } else if (filter === "Rejected") {
                await fetchRejectedApplicants();
            }else if (filter === "Offered") {
                await fetchOfferedApplicants();}

            alert("Applicant added to rejected list");
        } catch (error) {
            console.error("Error adding applicant to rejected list:", error);
        }
    };


    const handleOffer = async (applicantId) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");
    
            const idToken = await user.getIdToken();
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
            alert(`Offer for ${data.job_title} sent successfully!`);
            
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
            if (!user) {
                throw new Error("User not authenticated");
            }
    
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
            if (!response.ok) {
                throw new Error("Failed to fetch match score");}
    
            const data = await response.json();
            if (data.success) {
                alert(`Match Score for Applicant ${applicantId}: ${data.matchscore}%`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error fetching match score:", error);
            alert("Error fetching match score");
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
                                    <button className="offer-button" onClick={() => handleOffer(applicant.uid, jobId)}>
                                        Offer
                                    </button>)}
                                
                            {filter !== "Rejected" && filter !== "Offered" && filter !== "Interview" && (
                                <button className="interview-button" onClick={() => handleInterview(applicant.uid, jobId) }>
                                    Interview
                                </button>)}
            
                                <button className="match-score-button" onClick={() => handleMatchScore(applicant.uid, jobId)}>
                                    Match Score
                                </button>
                                <button className="chat-button" onClick={() => handleChat(applicant.uid)}>
                                    Chat
                                </button>
                            {filter !== "Rejected" && filter !== "Offered" && (
                                <button className="reject-button" onClick={() => handleReject(applicant.uid, jobId)}>
                                    Reject
                                </button> )}

                                <button className="view-cv-button" onClick={() => viewCV(applicant.uid)}>
                                    View CV
                                </button>
                            </div>
                        
                           {/*
                                <div className="applicant-tags">
                                    {applicant.tags.map(tag => (
                                        <span key={tag} className="applicant-tag">
                                            {tag} <span className="remove-tag"></span>
                                        </span>
                                    ))}
                                    <input 
                                        type="text"
                                        placeholder="Add a tag..."
                                        className="tag-input"
                                    />
                                </div>
                                */}

                        </div>
                    ))
                ) : (
                    <p className="no-applicants">No applicants found.</p>
                )}
            </section>
            {showInterviewPopup && selectedApplicant && (
      <InterviewPopup
        applicantName={`${selectedApplicant.first_name} ${selectedApplicant.last_name}`}
        jobTitle={job?.Title || "the position"}
        onClose={() => setShowInterviewPopup(false)}
        onSchedule={handleScheduleInterview}
      />
    )}
        </main>
    );
};

export default ViewApplicants;

