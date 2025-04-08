import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/style.css"; 
import { getAuth } from "firebase/auth";

const EditProfile = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    location: "",
    industry: "",
    experience: "",
    qualifications: "",
    pastJobs: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const idToken = await user.getIdToken();
        const response = await fetch(`http://localhost:5000/get-profile/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchProfile();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:5000/update-profile/${user.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      console.log("Profile data to submit:", formData);
      alert("Profile updated successfully! ");
      navigate("/dashboard-jobseeker");}
    catch (error) {
      console.error("Error updating profile:", error);
      alert(`Error: ${error.message}`);
    }
  };


  return (
    <main className="edit-profile-container">
    <div className="edit-jobseeker-profile__card-container">
      <button
        className="edit-jobseeker-profile__back-button"
        onClick={() => navigate(-1)}
        disabled={isSubmitting}
      >
        Go Back
      </button>

      <h2 className="edit-jobseeker-profile__title">Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        <div className="edit-jobseeker-profile__form-grid">
          <div className="edit-jobseeker-profile__field-group">
            <label>Name*</label>
            <input
              type="text"
              name="name"
              value={formData.first_name}
              onChange={handleChange}
              className="edit-jobseeker-profile__input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="edit-jobseeker-profile__field-group">
            <label>Name*</label>
            <input
              type="text"
              name="name"
              value={formData.last_name}
              onChange={handleChange}
              className="edit-jobseeker-profile__input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="edit-jobseeker-profile__field-group">
            <label>Location*</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="edit-jobseeker-profile__input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="edit-jobseeker-profile__field-group">
            <label>Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="edit-jobseeker-profile__input"
              disabled={isSubmitting}
            />
          </div>

          <div className="edit-jobseeker-profile__field-group">
            <label>Experience</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="edit-jobseeker-profile__input"
              disabled={isSubmitting}
            />
          </div>

          <div className="edit-jobseeker-profile__field-group edit-jobseeker-profile__full-width">
            <label>Qualifications</label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="edit-jobseeker-profile__textarea"
              disabled={isSubmitting}
            />
          </div>

          <div className="edit-jobseeker-profile__field-group edit-jobseeker-profile__full-width">
            <label>Past Jobs</label>
            <textarea
              name="pastJobs"
              value={formData.pastJobs}
              onChange={handleChange}
              className="edit-jobseeker-profile__textarea"
              disabled={isSubmitting}
            />
          </div>

          <div className="edit-jobseeker-profile__button-group">
            <button
              type="button"
              className="edit-jobseeker-profile__cancel-button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-jobseeker-profile__save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
);
};

export default EditProfile;
