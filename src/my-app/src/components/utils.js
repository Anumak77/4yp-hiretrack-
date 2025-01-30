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
  
  export const analyzeSimilarity = async (text2) => {
    try {
      const text1 = await fetchPdfFromFirestore();
  
      const response = await axios.post('http://localhost:5000/similarity', {
        text1,
        text2,
      });
  
      return response.data.similarity; 
    } catch (error) {
      console.error('Error analyzing similarity:', error);
      throw error;
    }
  };

  export const saveJobToFirestore = async (job) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobId = job.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const JobRef = doc(firestore, `users/${user.uid}/savedjobs/${jobId}`);
  
      await setDoc(JobRef, {
        ...job,
        savedAt: new Date().toISOString(),
      });
  
      console.log('File saved to Firestore');
    } catch (error) {
      console.error('Error saving job to Firestore:', error);
      throw error;
    }
  };

  export const fetchSavedJobs = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobsCollection = collection(firestore, `users/${user.uid}/savedjobs`);
      const jobsSnapshot = await getDocs(jobsCollection);
  
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Retrieved jobs:', jobs);
  
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs from Firestore:', error);
      throw error;
    }
  };

  export const applyJobToFirestore = async (job) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobId = job.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const JobRef = doc(firestore, `users/${user.uid}/appliedjobs/${jobId}`);
  
      await setDoc(JobRef, {
        ...job,
        savedAt: new Date().toISOString(),
      });
  
      console.log('File saved to Firestore');
    } catch (error) {
      console.error('Error saving job to Firestore:', error);
      throw error;
    }
  };

  export const fetchAppliedJobs = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const firestore = getFirestore();
      const jobsCollection = collection(firestore, `users/${user.uid}/appliedjobs`);
      const jobsSnapshot = await getDocs(jobsCollection);
  
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Retrieved jobs:', jobs);
  
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs from Firestore:', error);
      throw error;
    }
  }; 