import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobSearch from '../../pages/jobseekers/JobSearch';
import { act } from 'react';


test('renders the Job Search heading', () => {
  render(
    <MemoryRouter>
      <JobSearch />
    </MemoryRouter>
  );

  expect(screen.getByText(/Job Search/i)).toBeInTheDocument();
});

