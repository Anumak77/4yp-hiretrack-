import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../components/style.css"; 

const ViewApplicants = () => {
    const { id: jobId } = useParams(); 
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/get-applicants/${jobId}`);
                setApplicants(response.data.applicants);
                setLoading(false);
            } catch (error) {
                console.error(" Error fetching applicants:", error);
                setError("Failed to load applicants.");
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [jobId]);

    const handleMatchScore = async (applicantId) => {
        try {
            const response = await axios.post(`http://127.0.0.1:5000/get-match-score`, {
                applicantId: applicantId,
                jobId: jobId,
            });
            alert(`Match Score: ${response.data.matchScore}%`);
        } catch (error) {
            console.error("Error fetching match score:", error);
            alert("Failed to retrieve match score.");
        }
    };

    return (
        <main className="view-applicants-container">
            <button className="back-button-view" onClick={() => navigate(-1)}>Go Back</button>
            <h1 className="view-applicants-title">Applicants for Job</h1>

            {loading && <p>Loading applicants...</p>}
            {error && <p className="error-message">{error}</p>}

            <section className="applicant-list">
                {applicants.length > 0 ? (
                    applicants.map((applicant) => (
                        <div key={applicant.id} className="applicant-card">
                            <h2 className="applicant-name">{applicant.first_name} {applicant.last_name}</h2>
                            <p className="applicant-email"><strong>Email:</strong> {applicant.email}</p>
                            <p className="applicant-location"><strong>Location:</strong> {applicant.location || "Not provided"}</p>
                            <p className="applicant-phone"><strong>Phone:</strong> {applicant.phone_number || "Not provided"}</p>

                            <div className="applicant-actions">
                                <button className="interview-button">Interview</button>
                                <button className="reject-button">Reject</button>
                                <button className="chat-button">Chat</button>
                                <button className="match-score-button" onClick={() => handleMatchScore(applicant.id)}>Match Score</button>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <p className="no-applicants">No applicants found.</p>
                )}
            </section>
        </main>
    );
};

export default ViewApplicants;

