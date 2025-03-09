import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../components/style.css";

const ViewApplicants = () => {
    const { id: jobId } = useParams(); 
    const navigate = useNavigate();

    const mockApplicants = [
        { id: "1", first_name: "Test", last_name: "Applicant", email: "test@example.com", location: "Test City", phone_number: "123-456-7890", status: "Pending", tags: [] },
        { id: "2", first_name: "John", last_name: "Doe", email: "johndoe@example.com", location: "Somewhere, Earth", phone_number: "987-654-3210", status: "Shortlisted", tags: [] },
    ];

    const [applicants, setApplicants] = useState(mockApplicants);
    const [filter, setFilter] = useState("All");

    const handleStatusChange = (applicantId, newStatus) => {
        setApplicants(prevApplicants =>
            prevApplicants.map(applicant =>
                applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
            )
        );
    };

    const handleAddTag = (applicantId, event) => {
        if (event.key === "Enter" && event.target.value.trim()) {
            const newTag = event.target.value.trim();
            setApplicants(prevApplicants =>
                prevApplicants.map(applicant =>
                    applicant.id === applicantId
                        ? { ...applicant, tags: [...applicant.tags, newTag] }
                        : applicant
                )
            );
            event.target.value = "";
        }
    };

    const handleRemoveTag = (applicantId, tagToRemove) => {
        setApplicants(prevApplicants =>
            prevApplicants.map(applicant =>
                applicant.id === applicantId
                    ? { ...applicant, tags: applicant.tags.filter(tag => tag !== tagToRemove) }
                    : applicant
            )
        );
    };

    const handleMatchScore = (applicantId) => {
        const mockScore = Math.floor(Math.random() * 100);
        alert(`Mock Match Score for Applicant ${applicantId}: ${mockScore}%`);
    };

    const handleChat = (applicantId) => {
        alert(`Chat initiated with Applicant ${applicantId}`);
    };

    const filteredApplicants = filter === "All" ? applicants : applicants.filter(applicant => applicant.status === filter);

    return (
        <main className="view-applicants-container">
            <button className="back-button-view" onClick={() => navigate(-1)}>Go Back</button>
            <h1 className="view-applicants-title">Applicants for Job ID: {jobId}</h1>

            <label>Filter by Status</label>
            <div className="status-filter">
                {["All", "Pending", "Rejected"].map(status => (
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
                {filteredApplicants.length > 0 ? (
                    filteredApplicants.map(applicant => (
                        <div key={applicant.id} className="applicant-card">
                            <h2 className="applicant-name">{applicant.first_name} {applicant.last_name}</h2>
                            <p className="applicant-email"><strong>Email:</strong> {applicant.email}</p>
                            <p className="applicant-location"><strong>Location:</strong> {applicant.location || "Not provided"}</p>
                            <p className="applicant-phone"><strong>Phone:</strong> {applicant.phone_number || "Not provided"}</p>

                            <div className="applicant-actions">
                                <button className="interview-button" onClick={() => handleStatusChange(applicant.id, "Interview")}>
                                    Interview
                                </button>
                                <button className="match-score-button" onClick={() => handleMatchScore(applicant.id)}>
                                    Match Score
                                </button>
                                <button className="chat-button" onClick={() => handleChat(applicant.id)}>
                                    Chat
                                </button>
                                <button className="reject-button" onClick={() => handleStatusChange(applicant.id, "Rejected")}>
                                    Reject
                                </button>
                            </div>

                            <div className="applicant-tags">
                                {applicant.tags.map(tag => (
                                    <span key={tag} className="applicant-tag">
                                        {tag} <span className="remove-tag" onClick={() => handleRemoveTag(applicant.id, tag)}>❌</span>
                                    </span>
                                ))}
                                <input 
                                    type="text"
                                    placeholder="Add a tag..."
                                    className="tag-input"
                                    onKeyDown={(event) => handleAddTag(applicant.id, event)}
                                />
                            </div>

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
