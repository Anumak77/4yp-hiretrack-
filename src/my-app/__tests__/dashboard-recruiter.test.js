import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
// import DashRecruiter from '../../src/pages/recruiters/dashboard-recruiter';
import DashRecruiter from '../src/pages/recruiters/dashboard-recruiter'
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-chart" />
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      getIdToken: async () => 'fake-token',
      uid: 'mock-id',
    },
    onAuthStateChanged: (cb) => cb({ uid: 'mock-id' }),
  }),
}));

global.fetch = jest.fn((url) => {
  if (url.includes('/numjobpostings')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ num_jobpostings: 3 }),
    });
  } else if (url.includes('/numapplicants')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ total_applicants: 8 }),
    });
  } else if (url.includes('/fetch-jobs')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  } else {
    return Promise.reject('Unknown endpoint');
  }
});

describe('DashRecruiter Unit Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard-recruiter']}>
          <Routes>
            <Route path="/dashboard-recruiter" element={<DashRecruiter />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/createpost" element={<div>Create Job Page</div>} />
            <Route path="/jobtracker-recruiter" element={<div>Job Tracker Page</div>} />
            <Route path="/recruiterchat" element={<div>Inbox Page</div>} />
          </Routes>
        </MemoryRouter>
      );
    });
  });

  it('renders dashboard heading and chart', () => {
    expect(screen.getByText(/Recruiter Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText('Job Postings Stats')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });


  it('navigates to correct pages when buttons clicked', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Post a Job/i }));
    expect(await screen.findByText('Create Job Page')).toBeInTheDocument();

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard-recruiter']}>
          <Routes>
            <Route path="/dashboard-recruiter" element={<DashRecruiter />} />
            <Route path="/jobtracker-recruiter" element={<div>Job Tracker Page</div>} />
          </Routes>
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /Job Tracker/i }));
    expect(await screen.findByText('Job Tracker Page')).toBeInTheDocument();
  });

  it('logs out and navigates to login', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

});