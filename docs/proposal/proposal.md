# School of Computing &mdash; Year 4 Project Proposal Form

> Edit (then commit and push) this document to complete your proposal form.
> Make use of figures / diagrams where appropriate.
>
> Do not rename this file.

## SECTION A

|                     |                   |
|---------------------|-------------------|
|Project Title:       | HireTrack            |
|Student 1 Name:      | Siri Nandipaty            |
|Student 1 ID:        | 21449384            |
|Student 2 Name:      | Anushree Umak            |
|Student 2 ID:        | 21343003 |
|Project Supervisor:  | Graham Healy            |

> Ensure that the Supervisor formally agrees to supervise your project; this is only recognised once the
> Supervisor assigns herself/himself via the project Dashboard.
>
> Project proposals without an assigned
> Supervisor will not be accepted for presentation to the Approval Panel.

## SECTION B

> Guidance: This document is expected to be approximately 3 pages in length, but it can exceed this page limit.
> It is also permissible to carry forward content from this proposal to your later documents (e.g. functional
> specification) as appropriate.
>
> Your proposal must include *at least* the following sections.


### Introduction

Hiretrack aims to develop an AI-powered platform that helps users optimize their CVs by comparing them with job descriptions, highlighting key skills, and providing a tools to analyze and keept track of application processes. Using techniques like BERT, TF-IDF, and cosine similarity, the platform will offer insights into how well a CV aligns with job postings. It will also streamline job search management with tools for tracking applications, visualizing progress and scheduling events through calendar integration. With external job posting APIs and a secure, user-friendly interface built on Django, React, and Firebase, the platform will empower users to enhance their applications and improve their chances of success.

### Outline

> Outline the proposed project.

### Background

As 4th-year students preparing to enter the job market, we’ve found the application process to be exhausting and frustrating, especially when it comes to finding suitable job postings. Too often, we spend time reviewing a graduate position only to discover at the end that it requires specific coding languages or experience we don’t have. With HireTrack, we aim to address these challenges by streamlining job searches and helping candidates focus on the opportunities best aligned with their skills and aspirations. It is also difficult to keep track of assessments and upcoming interviews so we have come up with the idea of HireTrack based on our own experiences and the experiences of other students.

### Achievements

The main functions that HireTrack will provide are:
- A place to upload, edit and compare your CV with a job posting to see compatibility
- A search functionality to find job postings that are suitable for your CV
- A tracker to monitor your application progress across companies
- An analytics dashboard to examine the trends in your application experience 
- A calendar that updates you on interviews and asessment dates 

### Justification

> Why/when/where/how will it be useful?

### Programming language(s)

- Java 
- Javascript
- Python

### Programming tools / Tech stack

> Describe the compiler, database, web server, etc., and any other software tools you plan to use.

### Hardware

N/A

### Learning Challenges

> List the main new things (technologies, languages, tools, etc) that you will have to learn.

### Breakdown of work

#### Phase A
- **Backend Setup (Django)**:
Build a Django backend to handle user management (sign-up, login) and basic CV handling.
Set up a secure file upload system for CVs (e.g., in PDF or Word format).
Store CV data in a database (Firebase or Django ORM).

- **Job Posting Integration**:
Integrate APIs like Google Jobs or Glassdoor to fetch job listings.
Provide a list of relevant job postings based on simple keyword searches.

- **Fallback Plan**:
If the external API (e.g., Glassdoor) fails, allow users to manually enter job details or upload job postings in a structured format (like a form with fields for job title, description, etc.).
- **CV Management**:
Allow users to upload, edit, and manage multiple versions of their CVs.
Display uploaded CVs in an organized, user-friendly interface.
- **Employer Search Prototype**:
Build a basic search functionality that allows employers or recruiters to search the platform’s CV database.
Use simple keyword matching to return relevant CVs.
Provide basic filters for employers, such as location, job title, or industry.

#### Phase B 

- **Advanced CV-Job Matching**: (Cosine Similarity)
Implement a feature using TF-IDF and cosine similarity to compare job descriptions with user CVs.
Highlight similarities and differences between job postings and CVs.
Provide a “match score” based on how well the CV fits the job requirements.

- **Job Application Tracker**:
Enable users to track their job applications with a spreadsheet-like interface.
Allow users to manually update the status of their applications (e.g., applied, rejected, interview scheduled).
Display progress at a glance with a color-coded or status-based system.
- **Analytics Dashboard**:
Provide users with visualizations of their job search activity (e.g., the number of applications sent, responses received, interviews scheduled).
Use scikit-learn to analyze trends in the user’s activity and provide suggestions for improvement (e.g., which types of jobs are getting more responses).
- **Similar CV Finder for Employers**:
Extend the basic employer search functionality to include “find similar CVs” based on cosine similarity.
Allow employers to upload job descriptions and search for the most relevant CVs in the system based on required skills and experience.
- **Calendar Integration**:
Implement a calendar feature for scheduling interviews and application deadlines.
Allow users to manually input dates or parse incoming emails for interview or assessment dates.
Integrate Google Calendar API to sync with users' calendars and send reminders for upcoming events.
- **Fallback Plan**:
If the Google Calendar API fails, allow users to export calendar data to other formats (e.g., .ics files) or manually manage their events in the app.


#### Phase C. 
- **GPT-Powered CV Suggestions**:
Use GPT to analyze CVs and provide personalized suggestions for improvement.
Tailor recommendations based on job descriptions, highlighting how users can better present relevant skills or experience.
Suggest action verbs, skill enhancements, and formatting improvements to help users make their CV more attractive to employers.

- **Collaborative CV Building**
Allow users to share their CV with mentors, professors, or colleagues for feedback.
Provide real-time commenting and suggestion tools within the app, similar to Google Docs’ collaboration features.
- **Explore More Intelligent Job Searc**h
Use machine learning algorithms to recommend jobs based on past applications, user preferences, and patterns in successful job matches.
Explore NLP models to analyze job descriptions beyond simple keyword matching for deeper understanding and better job recommendations.


#### Student 1

##### Phase A:
- Backend Setup (Django)
- Secure CV Upload and Storage
- Job Posting Retrieval (Google Jobs/ Glassdoor API/static database)
- Basic Employer Search Prototype
##### Phase B: 
- Advanced CV-Job Matching (Cosine Similarity) 
- Job Application Tracker (Backend)
- Analytics Dashboard (Backend)
- Similar CV Finder for Employers
##### Phase C: 
- GPT-Powered CV Suggestions (Backend)

#### Student 2

##### Phase A:
- Frontend Setup (React or Vue.js)
- CV Management UI (Upload, View, Edit)
- Basic Employer Search Prototype UI
##### Phase B: 
- Advanced CV-Job Matching (Frontend Integration) 
- Job Application Tracker UI 
- Analytics Dashboard (Frontend Visualizations) 
- Calendar Integration (Frontend)
###### Phase C: 
- Collaborative CV Building UI 
- GPT-Powered CV Suggestions (Frontend)


