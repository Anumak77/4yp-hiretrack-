import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../../components/style.css";

const ViewJobPostings = () => {
    const [jobPostings, setJobPostings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); 
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                console.log("User authenticated:", firebaseUser.email);
                setUser(firebaseUser);
            } else {
                console.warn("No user authenticated!");
                setUser(null);
                setError("User not authenticated");
                setLoading(false);
            }
        });

        return () => unsubscribe(); 
    }, []);

    useEffect(() => {
        if (!user) return; 

        const fetchJobPostings = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "jobposting"));
                const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Job Postings Fetched:", jobs);
                setJobPostings(jobs);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching job postings:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchJobPostings();
    }, [user]); 
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    
        try {
            const user = getAuth().currentUser;
            if (!user) {
                console.error("User not authenticated");
                alert("You need to be logged in to delete a job.");
                return;
            }
    
            const idToken = await user.getIdToken(); 
    
            const response = await fetch(`http://127.0.0.1:5000/delete-job/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": idToken, // 
                },
            });
    
            if (!response.ok) {
                throw new Error(`Failed to delete job. Server responded with ${response.status}`);
            }
    
            console.log(`🗑️ Deleted job posting with ID: ${id}`);
            setJobPostings(prevJobs => prevJobs.filter(job => job.id !== id)); 
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Error deleting job. Please try again.");
        }
    };
    

    const handleViewApplicants = (id) => {
        navigate(`/viewapplicants/${id}`);
    };

    return (
        <main className="view-job-container">
            <div className="view-job-header">
                <button className="back-button-viewjob-back" onClick={() => navigate('/dashboard-recruiter')}>
                    Go Back
                </button>
            </div>
            <h1 className="view-job-title">Job Postings</h1>
            <br></br>
            <br></br>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            <section className="job-list">
                {jobPostings.length > 0 ? (
                    jobPostings.map((job) => (
                        <div key={job.id} className="job-card">
                            <div className="job-card-header">
                                <h2 className="job-card-title">{job.title}</h2>
                                <p className="job-card-company">{job.company} - {job.location}</p>
                            </div>
                            <p className="job-card-description">{job.description}</p>
                            
                            <div className="job-card-actions">
                                <button className="view-applicants-button" onClick={() => handleViewApplicants(job.id)}>
                                    View Applicants
                                </button>
                                <button className="delete-button" onClick={() => handleDelete(job.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <p>No job postings found.</p>
                )}
            </section>
        </main>
    );
};

export default ViewJobPostings;
