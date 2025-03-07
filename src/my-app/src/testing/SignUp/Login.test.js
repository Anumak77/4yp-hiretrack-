// Mock Firebase Auth & Firestore
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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/SignUp/Login';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

beforeEach(() => {
  localStorage.clear();
});

describe('Login Component', () => {
  test('logs in successfully and redirects', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'testing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(loginButton); 

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled(); // Ensure Firebase Auth was called
    });

    await waitFor(() => {
      expect(getDoc).toHaveBeenCalled(); // Ensure Firestore was called
    });

    await waitFor(() => {
      expect(localStorage.getItem('userRole')).toBe('Job Seeker');
    });
  });
});
