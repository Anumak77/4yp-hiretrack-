# School of Computing &mdash; Year 4 Project Proposal Form
3

## SECTION A

|                     |                   |
|---------------------|-------------------|
|Project Title:       | HireTrack            |
|Student 1 Name:      | Siri Nandipaty            |
|Student 1 ID:        | 21449384            |
|Student 2 Name:      | Anushree Umak            |
|Student 2 ID:        | 21343003 |
|Project Supervisor:  | Graham Healy            |


## SECTION B


### Introduction
>Hiretrack aims to develop an AI-powered platform that helps users optimize their CVs by comparing them with job >descriptions, highlighting key skills, and providing a tools to analyze and keept track of application processes. >Using techniques like BERT, TF-IDF, and cosine similarity, the platform will offer insights into how well a CV >aligns with job postings. It will also streamline job search management with tools for tracking applications, >visualizing progress and scheduling events through calendar integration. With external job posting APIs and a >secure, user-friendly interface built on Django, React, and Firebase, the platform will empower users to enhance >their applications and improve their chances of success.

### Outline
>- AI-Powered CV Optimization: Compare CVs with job postings using BERT, TF-IDF, and cosine similarity, with personalized suggestions for improvements.
>- Job Tracking & Analytics: Track applications, visualize progress, and get data-driven insights.
>- Calendar Integration: Manage deadlines and interviews with Google Calendar sync.
>- Collaborative CV Editing: Share CVs for real-time feedback from mentors or colleagues.
>- Job Search API Integration: Pull listings from platforms like Google Jobs and Glassdoor.
>- Secure & Scalable Design: Built with Django, React, and Firebase for a smooth user experience.

### Background
>As 4th-year students preparing to enter the job market, we’ve found the application process to be exhausting and >frustrating, especially when it comes to finding suitable job postings. Too often, we spend time reviewing a >graduate position only to discover at the end that it requires specific coding languages or experience we don’t >have. With HireTrack, we aim to address these challenges by streamlining job searches and helping candidates ?>focus on the opportunities best aligned with their skills and aspirations. It is also difficult to keep track of >assessments and upcoming interviews so we have come up with the idea of HireTrack based on our own experiences >and the experiences of other students.

### Achievements
>The main functions that HireTrack will provide are:
>- A place to upload, edit and compare your CV with a job posting to see compatibility
>- A search functionality to find job postings that are suitable for your CV
>- A tracker to monitor your application progress across companies
>- An analytics dashboard to examine the trends in your application experience 
>- A calendar that updates you on interviews and asessment dates 

### Justification
>HireTrack will be useful throughout the job search process by helping candidates identify suitable roles, >optimize their CVs, and stay organized. It’s particularly helpful when managing multiple applications, ensuring >users focus on positions aligned with their skills. The platform can be used anywhere, from home or on-the-go, >with features like application tracking, CV comparisons and calendar integration. By streamlining searches and >offering insights, HireTrack reduces the frustration of rejections and improves the efficiency and success of job >applications.

### Programming language(s)
>- Java 
>- Javascript
>- Python

### Programming tools / Tech stack
##### Backend (Django and Java Integration)
>- Django (Python framework): For handling backend services such as user authentication, CV storage, API integration, etc.
>- Postman: For API testing.
>- Firebase or PostgreSQL: For storing CVs, user data, and managing authentication (Firebase also supports real-time syncing across devices).
>- TF-IDF and cosine similarity using scikit learn
##### Frontend Options (JavaScript with Java Focus)
>- React.js
##### AI/ML Tools (for Skill Matching and CV Suggestions)
>- GPT-3 or GPT-4 API (for personalized CV suggestions): OpenAI's API to integrate GPT with the backend for generating personalized recommendations.
>- BERT (Bidirectional Encoder Representations from Transformers): BERT for NLP-based skill matching; it will be implemented either in Python (via Django) 
>- Apache Lucene (Java): For text indexing and cosine similarity in Java.
##### Collaboration and Version Control:
>- Git: For version control and collaborative coding.
>- GitHub or GitLab: For repository hosting, issue tracking, and project management.
### Hardware

>N/A

### Learning Challenges
>- Implementing AI Models: Applying BERT, TF-IDF, and cosine similarity effectively.
>- API Integration: Connecting with Google Jobs, Glassdoor, and Google Calendar APIs.
>- Real-Time Collaboration: Enabling smooth, multi-user CV editing and feedback.
>- Data Security & Scalability: Ensuring secure file uploads and reliable user authentication.
>- Frontend-Backend Communication: Building a seamless interface with Django and React.

### Breakdown of work

>#### Phase A
>- **Backend Setup (Django)**:
>Build a Django backend to handle user management (sign-up, login) and basic CV handling.
>Set up a secure file upload system for CVs (e.g., in PDF or Word format).
>Store CV data in a database (Firebase or Django ORM).
>- **Job Posting Integration**:
>Integrate APIs like Google Jobs or Glassdoor to fetch job listings.
>Provide a list of relevant job postings based on simple keyword searches.
>- **Fallback Plan**:
>If the external API (e.g., Glassdoor) fails, allow users to manually enter job details or upload job postings in >a structured format (like a form with fields for job title, description, etc.).
>- **CV Management**:
>Allow users to upload, edit, and manage multiple versions of their CVs.
>Display uploaded CVs in an organized, user-friendly interface.
>- **Employer Search Prototype**:
>Build a basic search functionality that allows employers or recruiters to search the platform’s CV database.
>Use simple keyword matching to return relevant CVs.
>Provide basic filters for employers, such as location, job title, or industry.
>#### Phase B 
>- **Advanced CV-Job Matching**: (Cosine Similarity)
>Implement a feature using TF-IDF and cosine similarity to compare job descriptions with user CVs.
>Highlight similarities and differences between job postings and CVs.
>Provide a “match score” based on how well the CV fits the job requirements.
>- **Job Application Tracker**:
>Enable users to track their job applications with a spreadsheet-like interface.
>Allow users to manually update the status of their applications (e.g., applied, rejected, interview scheduled).
>Display progress at a glance with a color-coded or status-based system.
>- **Analytics Dashboard**:
>Provide users with visualizations of their job search activity (e.g., the number of applications sent, responses >received, interviews scheduled).
>Use scikit-learn to analyze trends in the user’s activity and provide suggestions for improvement (e.g., which >types of jobs are getting more responses).
>- **Similar CV Finder for Employers**:
>Extend the basic employer search functionality to include “find similar CVs” based on cosine similarity.
>Allow employers to upload job descriptions and search for the most relevant CVs in the system based on required >skills and experience.
>- **Calendar Integration**:
>Implement a calendar feature for scheduling interviews and application deadlines.
>Allow users to manually input dates or parse incoming emails for interview or assessment dates.
>Integrate Google Calendar API to sync with users' calendars and send reminders for upcoming events.
>- **Fallback Plan**:
>If the Google Calendar API fails, allow users to export calendar data to other formats (e.g., .ics files) or >manually manage their events in the app.
>#### Phase C. 
>- **GPT-Powered CV Suggestions**:
>Use GPT to analyze CVs and provide personalized suggestions for improvement.
>Tailor recommendations based on job descriptions, highlighting how users can better present relevant skills or >experience.
>Suggest action verbs, skill enhancements, and formatting improvements to help users make their CV more attractive >to employers.
>- **Collaborative CV Building**
>Allow users to share their CV with mentors, professors, or colleagues for feedback.
>Provide real-time commenting and suggestion tools within the app, similar to Google Docs’ collaboration features.
>- **Explore More Intelligent Job Searc**h
>Use machine learning algorithms to recommend jobs based on past applications, user preferences, and patterns in >successful job matches.
>Explore NLP models to analyze job descriptions beyond simple keyword matching for deeper understanding and better >job recommendations.


#### Siri Nandipaty
>##### Phase A:
>- Backend Setup (Django)
>- Secure CV Upload and Storage
>- Job Posting Retrieval (Google Jobs/ Glassdoor API/static database)
>- Basic Employer Search Prototype
>##### Phase B: 
>- Advanced CV-Job Matching (Cosine Similarity) 
>- Job Application Tracker (Backend)
>- Analytics Dashboard (Backend)
>- Similar CV Finder for Employers
>##### Phase C: 
>- GPT-Powered CV Suggestions (Backend)

#### Anushree Umak
>##### Phase A:
>- Frontend Setup (React or Vue.js)
>- CV Management UI (Upload, View, Edit)
>- Basic Employer Search Prototype UI
>##### Phase B: 
>- Advanced CV-Job Matching (Frontend Integration) 
>- Job Application Tracker UI 
>- Analytics Dashboard (Frontend Visualizations) 
>- Calendar Integration (Frontend)
>###### Phase C: 
>- Collaborative CV Building UI 
>- GPT-Powered CV Suggestions (Frontend)


