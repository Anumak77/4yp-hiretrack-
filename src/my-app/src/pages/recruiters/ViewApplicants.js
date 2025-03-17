import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import "../../components/style.css";

const ViewApplicants = () => {
    const { id: jobId } = useParams(); 
    console.log("Job ID from URL:", jobId);
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 

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
        }
    }, [filter, jobId]);

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
            }

            alert("Applicant added to interview list");
        } catch (error) {
            console.error("Error adding applicant to interview list:", error);
            alert("Error adding applicant to interview list");
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
            }

            alert("Applicant added to rejected list");
        } catch (error) {
            console.error("Error adding applicant to rejected list:", error);
            alert("Error adding applicant to rejected list");
        }
    };



    const handleStatusChange = (applicantId, newStatus) => {
        setApplicants(prevApplicants =>
            prevApplicants.map(applicant =>
                applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
            )
        );
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
        alert(`Chat initiated with Applicant ${applicantId}`);
    };

    return (
        <main className="view-applicants-container">
            <button className="back-button-view" onClick={() => navigate(-1)}>Go Back</button>
            <h1 className="view-applicants-title">Applicants for Job ID: {jobId}</h1>

            <label>Filter by Status</label>
            <div className="status-filter">
                {["All", "Interview", "Rejected"].map(status => (
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
                                <button className="interview-button" onClick={() => handleInterview(applicant.uid, jobId) }>
                                    Interview
                                </button>
                                <button className="match-score-button" onClick={() => handleMatchScore(applicant.uid, jobId)}>
                                    Match Score
                                </button>
                                <button className="chat-button" onClick={() => handleChat(applicant.uid)}>
                                    Chat
                                </button>
                                <button className="reject-button" onClick={() => handleReject(applicant.uid, jobId)}>
                                    Reject
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
        </main>
    );
};

export default ViewApplicants;

