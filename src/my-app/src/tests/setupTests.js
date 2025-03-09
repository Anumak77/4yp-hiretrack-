jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    signInWithEmailAndPassword: jest.fn(() => 
      Promise.resolve({ user: { uid: '12345' } })
    ),
  }));
  
  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(() => 
      Promise.resolve({ exists: () => true, data: () => ({ userType: 'Job Seeker' }) })
    ),
  }));
  