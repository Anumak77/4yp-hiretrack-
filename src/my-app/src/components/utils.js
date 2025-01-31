import { getFirestore, doc, setDoc, getDoc, collection, getDocs  } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

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

    const response = await axios.post('http://127.0.0.1:5000/compare_with_description', {
      JobDescription: job.JobDescription,
      cv: cvBase64.split(',')[1],
    });

    const similarityScore = response.data['cosine similarity'];
  
      await setDoc(JobRef, {
        ...job,
        savedAt: new Date().toISOString(),
        matchScore: (similarityScore * 100).toFixed(2)
      });
  
      console.log('File saved to Firestore');
    } catch (error) {
      console.error('Error saving job to Firestore:', error);
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

  export const fetchJobsListings = async (firebasecollection) => {
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