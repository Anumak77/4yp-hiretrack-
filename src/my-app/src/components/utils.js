import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc, arrayUnion, increment  } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { getDatabase, ref, push, set } from "firebase/database";

export const savePdfToFirestore = async (file) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const base64File = await convertToBase64(file);
  
      const firestore = getFirestore();
      // Correct path to a document
      const docRef = doc(firestore, `users/${user.uid}/cv/cvFile`);
  
      await setDoc(docRef, {
        fileData: base64File,
        uploadedAt: new Date(),
      });
  
      console.log('File saved to Firestore');
    } catch (error) {
      console.error('Error saving file to Firestore:', error);
      throw error;
    }
  };
  
export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
export const fetchPdfFromFirestore = async () => {
    const firestore = getFirestore();
    const user = getAuth().currentUser;
  
    if (!user) throw new Error('User not authenticated');
  
    const docRef = doc(firestore, `users/${user.uid}/cv/cvFile`);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { fileData } = docSnap.data();
      return fileData; // Base64 data
    } else {
      throw new Error('No CV found for user');
    }
  };

  export const addJobToFirestore = async (job, firebasecollection) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobId = job.id || `${job.Company}-${job.Title}`.replace(/\s+/g, "-").toLowerCase();
      const JobRef = doc(firestore, `users/${user.uid}/${firebasecollection}/${jobId}`);
      const recruiterJobRef = doc(firestore, `users/${job.recruiterId}/jobposting/${jobId}/applicants/${user.id}`);
      const recruiterRef = doc(firestore, `users/${job.recruiterId}`);
      let applicationstatus;

      const jobSnap = await getDoc(JobRef);
    if (jobSnap.exists()) {
      console.log("Job already exists in Firestore.");
      return { success: false, message: "Job already applied to." };
    }

    const cvBase64 = await fetchPdfFromFirestore();
    if (!cvBase64) {
      console.log("No CV found for the user. Please upload a CV.");
      return { success: false, message: "No CV found" };
    }

    const response = await axios.post('http://127.0.0.1:500/compare_with_description', {
      JobDescription: job.JobDescription,
      JobRequirment: job.JobRequirment || "", 
      RequiredQual: job.RequiredQual || "",
      cv: cvBase64.split(',')[1],
    });

    if (firebasecollection == "appliedjobs"){
      await setDoc(recruiterJobRef, {
        userId: user.uid,
        appliedAt: new Date().toISOString(),
      });

      // Increment the number of applicants for the recruiter
      await updateDoc(recruiterRef, {
        applicantsnum: increment(1),
      });
      applicationstatus = "applied"
    }
    else if (firebasecollection == "savedjobs"){
      applicationstatus = "NA"
    }
    else if (firebasecollection == "interviewedjobs"){
      applicationstatus = "interviewed"
    }
    else if (firebasecollection == "rejected"){
      applicationstatus = "rejectedjobs"
    }


    const similarityScore = response.data['cosine similarity'];
    const matchScore = (similarityScore * 100).toFixed(2);

  console.log("Calculated Match Score:", matchScore);
  
      await setDoc(JobRef, {
        ...job,
        savedAt: new Date().toISOString(),
        matchScore: (similarityScore * 100).toFixed(2),
        applicationstatus: applicationstatus
      });
  
      console.log('File saved to Firestore');
      console.log({matchScore})
    } catch (error) {
      console.error('Error saving job to Firestore:', error);
      throw error;
    }
  };


  
  export const deleteJobToFirestore = async (job, firebasecollection) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobId = job.id || `${job.Company}-${job.Title}`.replace(/\s+/g, "-").toLowerCase();
      const JobRef = doc(firestore, `users/${user.uid}/${firebasecollection}/${jobId}`);

      const jobSnap = await getDoc(JobRef);
    if (jobSnap.exists()) {
      console.log("Job exists in Firestore.");
    }

    await deleteDoc(JobRef);
    console.log("Job deleted successfully from Firestore.");
  
      console.log('Job deleted from Firestore');
    } catch (error) {
      console.error('Error deleting job from Firestore:', error);
      throw error;
    }
  };



  export const fetchUserJobs = async (firebasecollection) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobsCollection = collection(firestore, `users/${user.uid}/${firebasecollection}`);
      const jobsSnapshot = await getDocs(jobsCollection);
  
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Retrieved jobs:', jobs);
  
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs from Firestore:', error);
      throw error;
    }
  };



  export const fetchJobsPosting = async (firebasecollection) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobsCollection = collection(firestore, `users/${user.uid}/${firebasecollection}`);
      const jobsSnapshot = await getDocs(jobsCollection);
  
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Retrieved jobs:', jobs);
  
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs from Firestore:', error);
      throw error;
    }
  };


  export const createJobPosting = async (job) => {
    try {

      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
      const firestore = getFirestore();
      const db = getDatabase();

      const newJobRef = push(ref(db));

      const jobId = job.id || `${job.Company}-${job.Title}`.replace(/\s+/g, "-").toLowerCase();
      const JobRef = doc(firestore, `users/${user.uid}/jobposting/${jobId}`);

      const jobWithMetadata = {
        ...job,
        recruiterId: user.uid,
        postedAt: new Date().toISOString(),
        date: "NA",
        jobpost: "NA"
      };

      await set(newJobRef, jobWithMetadata);

      await setDoc(JobRef, jobWithMetadata);

     
      
      console.log("Job successfully posted!");
    return { success: true, jobId };
  } catch (error) {
    console.error(" Error posting job:", error);
    return { success: false, error: error.message };
  }
    }

export const updateJobPosting = async (job) => {
  try {
    const firestore = getFirestore();
    const user = getAuth().currentUser;

    if (!user) throw new Error("User not authenticated");

    
    const jobRef = doc(firestore, `users/${user.uid}/jobposting/${job.id}`);

    
    await updateDoc(jobRef, { ...job });

    console.log("Job successfully updated!");
    return { success: true };
  } catch (error) {
    console.error("Error updating job posting:", error);
    return { success: false, error: error.message };
  }
};


export const fetchApplicants = async (jobId) => {
  try {
    const firestore = getFirestore();
    const user = getAuth().currentUser;
    if (!user) throw new Error("User not authenticated");

    // Reference to the job posting
    const jobDocRef = doc(firestore, `users/${user.uid}/jobposting/${jobId}/applicants/applicants`);
    const jobDocSnap = await getDoc(jobDocRef);

    if (!jobDocSnap.exists()) {
      throw new Error("Job not found or no applicants.");
    }

    const jobData = jobDocSnap.data();
    const applicantIds = jobData.applicants || [];
    
    console.log(applicantIds);  // Debug: Check the list of applicant IDs

    if (applicantIds.length === 0){
      console.log("no applicants")
      return [];
    }

    // Fetch applicant data
    const applicantsData = await Promise.all(
      applicantIds.map(async (applicantId) => {
        const userRef = doc(firestore, `users/${applicantId}`);
        const userSnap = await getDoc(userRef);

        console.log(userSnap.data()); // Debug: Check the data of each applicant

        if (!userSnap.exists()) return null;
        return { id: applicantId, ...userSnap.data() };
      })
    );

    // Return only non-null applicant data
    return applicantsData.filter(applicant => applicant !== null);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return [];
  }
};



