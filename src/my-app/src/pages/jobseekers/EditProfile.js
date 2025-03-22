import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/style.css"; 

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    industry: "",
    experience: "",
    qualifications: "",
    pastJobs: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile data to submit:", formData);
    alert("Profile updated successfully! ");
    navigate("/dashboard-jobseeker"); 
  };

  return (
    <main className="edit-profile-container">
      <div className="edit-jobseeker-profile__card-container">
      <button 
  className="edit-jobseeker-profile__back-button"
  onClick={() => navigate(-1)}
>
  Go Back
</button>

  <h2 className="edit-jobseeker-profile__title">Edit Profile</h2>

  <div className="edit-jobseeker-profile__form-grid">
    <div className="edit-jobseeker-profile__field-group">
      <label>Name</label>
      <input type="text" placeholder="Alice Johnson" className="edit-jobseeker-profile__input" />
    </div>

    <div className="edit-jobseeker-profile__field-group">
      <label>Location</label>
      <input type="text" placeholder="New York, USA" className="edit-jobseeker-profile__input" />
    </div>

    <div className="edit-jobseeker-profile__field-group">
      <label>Industry</label>
      <input type="text" placeholder="Software Engineering" className="edit-jobseeker-profile__input" />
    </div>

    <div className="edit-jobseeker-profile__field-group">
      <label>Experience</label>
      <input type="text" placeholder="5 years" className="edit-jobseeker-profile__input" />
    </div>

    <div className="edit-jobseeker-profile__field-group edit-jobseeker-profile__full-width">
      <label>Qualifications</label>
      <textarea placeholder="B.Sc. in Computer Science" className="edit-jobseeker-profile__textarea"></textarea>
    </div>

    <div className="edit-jobseeker-profile__field-group edit-jobseeker-profile__full-width">
      <label>Past Jobs</label>
      <textarea placeholder="Frontend Developer at Google, Software Engineer at Microsoft" className="edit-jobseeker-profile__textarea"></textarea>
    </div>
  </div>

  <div className="edit-jobseeker-profile__button-group">
    <button className="edit-jobseeker-profile__cancel-button">Cancel</button>
    <button className="edit-jobseeker-profile__save-button">Save</button>
  </div>
</div>

    </main>
  );
};

export default EditProfile;
