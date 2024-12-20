import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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


  
  
  