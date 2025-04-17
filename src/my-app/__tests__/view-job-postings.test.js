import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import ViewJobPostings from '../src/pages/recruiters/viewjob-postings';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('firebase/app', () => ({
  getApps: () => [],
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      getIdToken: jest.fn().mockResolvedValue('fake-jwt-token'),
    },
  }),
}));


jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

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


beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/fetch-jobs')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockJobs)
      });
    }
    if (url.includes('/remove-tag')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tags: ['Remote'] }) 
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
  jest.clearAllMocks();
});


describe('ViewJobPostings Component', () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/viewjobpostings']}>
        <Routes>
          <Route path="/viewjobpostings" element={<ViewJobPostings />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders job postings after fetch', async () => {
    renderWithRouter();

    const title = screen.getByRole('heading', { name: /Job Postings/i });
    expect(title).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    });
  });

  it('opens delete modal and confirms deletion', async () => {
    renderWithRouter();
  
    await screen.findByText('Frontend Developer');
  
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); 
  
    await waitFor(() => {
      expect(screen.getByText('Delete Job Posting')).toBeInTheDocument();
    });
  
    const modal = screen.getByText('Delete Job Posting').closest('.confirmation-modal');
    const modalDeleteButton = within(modal).getByText('Delete');
    fireEvent.click(modalDeleteButton);
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/delete-job/job1'), expect.any(Object));
    });
  });
  

  it('adds a new tag to a job', async () => {
    renderWithRouter();

    await screen.findByText('Frontend Developer');

    const tagInput = screen.getAllByPlaceholderText('Add a tag...')[0];
    fireEvent.change(tagInput, { target: { value: 'NewTag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('NewTag')).toBeInTheDocument();
    });
  });

  it('removes an existing tag', async () => {
    renderWithRouter();

    await screen.findByText('React');

    const reactTag = screen.getAllByText('React')[0];
    const removeIcon = reactTag.parentElement.querySelector('.vj-remove-tag');
    fireEvent.click(removeIcon);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/remove-tag'), expect.any(Object));
    });
  });
});
