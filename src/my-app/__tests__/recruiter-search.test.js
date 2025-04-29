import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import RecruiterSearch from '../src/pages/recruiters/RecruiterSearch';
import RecruiterSearch from '../src/pages/recruiters/RecruiterSearch'
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockJobSeekers = [
  {
    first_name: 'Alice',
    last_name: 'Johnson',
    industry: 'Tech',
    location: 'London',
    experience: '2 years'
  },
  {
    first_name: 'Bob',
    last_name: 'Smith',
    industry: 'Finance',
    location: 'Dublin',
    experience: '5 years'
  }
];

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn((url) => {
    if (url.includes('fetch-jobseekers')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockJobSeekers)
      });
    }
    if (url.includes('search-jobseekers')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockJobSeekers[0]])
      });
    }
    return Promise.reject('Unknown endpoint');
  });
});

test('renders recruiter search heading and input', async () => {
  render(
    <MemoryRouter>
      <RecruiterSearch />
    </MemoryRouter>
  );

  expect(screen.getByText('Recruiter Search')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Search by name, industry, or jobs applied for')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument();
    expect(screen.getByText(/Bob Smith/)).toBeInTheDocument();
  });
});

test('filters job seekers based on search input', async () => {
  render(
    <MemoryRouter>
      <RecruiterSearch />
    </MemoryRouter>
  );

  await waitFor(() => screen.getByText(/Alice Johnson/));

  const searchInput = screen.getByPlaceholderText(/search by name/i);
  fireEvent.change(searchInput, { target: { value: 'Alice' } });

  await waitFor(() => {
    expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument();
    expect(screen.queryByText(/Bob Smith/)).not.toBeInTheDocument();
  });
});

test('navigates to jobseeker details on View Details click', async () => {
  render(
    <MemoryRouter>
      <RecruiterSearch />
    </MemoryRouter>
  );

  await waitFor(() => screen.getByText(/Alice Johnson/));

  const viewDetailsButton = screen.getAllByText('View Details')[0];
  fireEvent.click(viewDetailsButton);

  expect(mockNavigate).toHaveBeenCalledWith('/jobseeker-details', expect.anything());
});

test('navigates to applied jobs on View All Applied Jobs click', async () => {
  render(
    <MemoryRouter>
      <RecruiterSearch />
    </MemoryRouter>
  );

  await waitFor(() => screen.getByText(/Alice Johnson/));

  const viewAllButton = screen.getAllByText('View All Applied Jobs')[0];
  fireEvent.click(viewAllButton);

  expect(mockNavigate).toHaveBeenCalledWith('/view-all-applied-jobs', expect.anything());
});
