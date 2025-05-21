# HireTrack – Smart Job Matching & Recruiter Collaboration Platform

---

## Overview

**HireTrack** is a dual-role recruitment platform designed to simplify the hiring and job application process for both **recruiters** and **job seekers**. Inspired by our own frustrating internship application experience, we set out to build a smarter, more centralized space for job matching, resume editing, and recruiter collaboration—powered by modern AI technologies.

---

## Key Features

- **Resume Parsing**  
  Upload .pdf/.docx files and extract structured CV data using a custom parser built with regex, PyMuPDF, docx2txt, and spaCy.

- **Match Score Engine**  
  Hybrid model combining:
  - TF-IDF + Cosine Similarity
  - Sentence-BERT (MiniLM-L6-v2)
  - RAKE keyword overlap
  - Experience validation

- **GPT Suggestions**  
  Tailored CV improvements generated with [OpenRouter](https://openrouter.ai/) + `mistralai/mistral-7b-instruct`, displayed as lazy-loaded cards for performance.

- **Collaboration Requests**  
  Recruiters can annotate jobseeker CVs with sticky-note style feedback. Notes are structured, stored in Firestore, and shown contextually in the editor.

- **Google Calendar Integration**  
  OAuth-based scheduling lets recruiters book interviews and candidates view them in-app via Firebase + Google Calendar APIs.

- **Dashboards & Analytics**  
  Both users can track job activity and visualize trends using custom dashboards.

- **Secure & Efficient**  
  Temporary file handling, strict file validation, and clean API design ensure robust performance and data privacy.

---

##  Tech Stack

| Category        | Tools/Frameworks |
|----------------|------------------|
| **Frontend**   | React, Tailwind, Fuse.js, Chart.js |
| **Backend**    | Flask, PyMuPDF, python-docx, spaCy |
| **AI/NLP**     | Sentence-BERT, RAKE, TF-IDF, OpenRouter GPT |
| **Database**   | Firebase Firestore + Realtime DB |
| **CI/CD**      | GitLab CI, dev-ci.sh |
| **Testing**    | Cypress, Pytest, Jest |

---

## Testing Overview

-  **20+ Frontend Unit Tests** (React Testing Library / Jest)
-  **55+ Backend Unit Tests** (Pytest)
-  **23 Integration Tests** (Pytest)
-  **15+ Cypress E2E Tests**

> Test setup, commands, and full coverage are documented in `tests/`.

---

## System Architecture

- React frontend communicates with Flask backend via REST APIs.
- Firebase handles:
  - Auth (Jobseeker/Recruiter)
  - User profiles, job data, CVs
  - Chats, collaboration requests
- Google Calendar API enables scheduling.

---

## Poster Highlights

Our poster showcases:
-  Research-led AI: BERT, TF-IDF, RAKE, GPT
-  Deep Testing: E2E, Unit, Integration
-  UX-driven Collaboration Tools
-  Modular Backend Design (Blueprints)
-  Job/Applicant Analytics Visuals

We focused on building a **real-world-ready**, secure, and feature-rich application that bridges the gap between job seekers and recruiters—using technology that both empowers and simplifies.

---

## Why HireTrack Matters

- Replaces repetitive, inefficient job portals with a centralized, smart solution.
- Empowers job seekers to **personalize and improve** their applications.
- Helps recruiters **save time** and make faster, better hiring decisions.
- Demonstrates how AI and NLP can **practically** enhance user experience in recruitment.

---

## Contact

Have questions, suggestions, or feedback?

- Email: [umakanu6@gmail.com](mailto:umakanu6@gmail.com)  
- LinkedIn: [Anushree Umak](https://www.linkedin.com/in/anushree-umak-019175227/) 
---

> _Project submitted as part of the 4th Year Computer Science Capstone (CSC1097) at Dublin City University._
> **Developed by:**  
> Anushree Umak  
> Siri Nandipaty  
