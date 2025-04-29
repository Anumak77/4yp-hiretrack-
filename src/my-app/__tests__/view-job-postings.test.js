import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ViewJobPostings from '../src/pages/recruiters/viewjobpostings';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      getIdToken: async () => 'fake-token',
      uid: 'mock-uid',
    }
  }),
}));

global.fetch = jest.fn();

const mockJobs = [
  {
    id: 'job1',
    Title: 'Frontend Developer',
    Company: 'Awesome Co.',
    Location: 'United Kingdom',
    tags: ['React', 'Remote']
  },
  {
    id: 'job2',
    Title: 'Backend Engineer',
    Company: 'TechCorp',
    Location: 'India',
    tags: ['Node.js']
  }
];

describe('ViewJobPostings Component', () => {
  beforeEach(() => {
    fetch.mockImplementation((url) => {
      if (url.includes('/fetch-jobs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJobs)
        });
      }
      if (url.includes('/remove-tag')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tags: [] })
        });
      }
      if (url.includes('/add-tag')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tags: ['React', 'Remote', 'NewTag'] })
        });
      }
      if (url.includes('/delete-job')) {
        return Promise.resolve({ ok: true });
      }
    });
  });

  afterEach(() => {
    fetch.mockClear();
  });

  it('renders job postings after fetch', async () => {
    render(
      <MemoryRouter initialEntries={['/viewjobpostings']}>
        <Routes>
          <Route path="/viewjobpostings" element={<ViewJobPostings />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Job Postings/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    });
  });

  it('opens delete modal and confirms deletion', async () => {
    render(
      <MemoryRouter initialEntries={['/viewjobpostings']}>
        <Routes>
          <Route path="/viewjobpostings" element={<ViewJobPostings />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Frontend Developer');

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Job Posting')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/delete-job/job1'), expect.any(Object));
    });
  });

  it('adds a new tag to a job', async () => {
    render(
      <MemoryRouter initialEntries={['/viewjobpostings']}>
        <Routes>
          <Route path="/viewjobpostings" element={<ViewJobPostings />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Frontend Developer');

    const tagInput = screen.getAllByPlaceholderText('Add a tag...')[0];
    fireEvent.change(tagInput, { target: { value: 'NewTag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('NewTag')).toBeInTheDocument();
    });
  });

  it('removes an existing tag', async () => {
    render(
      <MemoryRouter initialEntries={['/viewjobpostings']}>
        <Routes>
          <Route path="/viewjobpostings" element={<ViewJobPostings />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('React');

    const removeBtn = screen.getAllByText('React')[0].querySelector('.vj-remove-tag');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/remove-tag'), expect.any(Object));
    });
  });
});
