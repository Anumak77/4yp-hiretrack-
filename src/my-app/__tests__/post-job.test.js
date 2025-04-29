import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostJob from '../src/pages/recruiters/postjob';

import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      getIdToken: async () => 'fake-token',
      uid: 'mock-id',
    }
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);

describe('PostJob Form', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders form inputs and submit button', () => {
    render(
      <MemoryRouter>
        <PostJob />
      </MemoryRouter>
    );

    expect(screen.getByText('Post a Job')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeInTheDocument();
    expect(screen.getByText('Post Job')).toBeInTheDocument();
  });

  it('opens confirmation modal with valid inputs and cancels', async () => {
    render(
      <MemoryRouter>
        <PostJob />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Job Title'), {
      target: { value: 'Senior Developer' },
    });

    fireEvent.change(screen.getByLabelText('Company'), {
      target: { value: 'Tech Innovations Inc.' },
    });

    fireEvent.change(screen.getByLabelText('About Company'), {
      target: { value: 'An innovative tech company.' },
    });

    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'United States' },
    });

    fireEvent.change(screen.getByLabelText('Job Description'), {
      target: { value: 'Develop applications.' },
    });

    fireEvent.change(screen.getByLabelText('Job Requirements'), {
      target: { value: '5+ years experience' },
    });

    fireEvent.change(screen.getByLabelText('Required Qualifications'), {
      target: { value: "Bachelor's in CS" },
    });

    fireEvent.change(screen.getByLabelText('Application Process'), {
      target: { value: 'Apply online' },
    });

    fireEvent.change(screen.getByLabelText('Deadline'), {
      target: { value: '2025-12-01' },
    });

    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2026-01-01' },
    });

    fireEvent.click(screen.getByText('Post Job'));

    await screen.findByText(/confirm job posting/i);


    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /confirm job posting/i })).not.toBeInTheDocument();
    });
  });
});
