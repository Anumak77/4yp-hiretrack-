import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobTrackerRecruiter from '../src/pages/recruiters/JobTracker-recruiter';
import '@testing-library/jest-dom';

jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart">Mock Line Chart</div>,
}));

describe('JobTrackerRecruiter Component', () => {
  beforeEach(() => {
    render(<JobTrackerRecruiter />);
  });

  it('renders job title buttons and form inputs', () => {
    expect(screen.getByText('Job Tracker')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Software Engineer|Data Analyst|Project Manager|Product Designer|Marketing Specialist/i })).toHaveLength(5);
    expect(screen.getByPlaceholderText('Enter Month (e.g., January)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Applications Count')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument();
  });

  it('shows error if trying to add job trend with missing fields', () => {
    fireEvent.click(screen.getByText('Software Engineer'));
    fireEvent.click(screen.getByText('Add Job Trend'));
    expect(screen.getByText(/Oops! Looks like you missed something/i)).toBeInTheDocument();
  });

  it('adds job trend and renders mock chart', () => {
    fireEvent.click(screen.getByText('Data Analyst'));

    fireEvent.change(screen.getByPlaceholderText('Enter Month (e.g., January)'), {
      target: { value: 'March' },
    });

    fireEvent.change(screen.getByPlaceholderText('Applications Count'), {
      target: { value: '150' },
    });

    fireEvent.click(screen.getByText('Add Job Trend'));

    expect(screen.queryByText(/Oops!/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
  });

  it('adds and displays custom tags', () => {
    const tagInput = screen.getByPlaceholderText('Add tags...');
    fireEvent.change(tagInput, { target: { value: 'urgent' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('toggles visibility status buttons', () => {
    const featuredBtn = screen.getByText('Featured');
    fireEvent.click(featuredBtn);
    expect(featuredBtn.classList.contains('selected')).toBe(true);
  });
});
