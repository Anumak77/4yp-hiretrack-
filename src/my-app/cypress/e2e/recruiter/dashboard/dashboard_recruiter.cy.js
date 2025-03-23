// describe('Recruiter Dashboard', () => {
//     beforeEach(() => {
//       cy.loginAsRecruiter(); // sets localStorage or userRole before page load
  
//       // ✅ Intercept BEFORE the page loads and triggers requests
//       cy.intercept('GET', '**/numjobpostings?recruiter_id=*', {
//         statusCode: 200,
//         body: { num_jobpostings: 5 },
//       }).as('getJobPostings');
  
//       cy.intercept('GET', '**/numapplicants?recruiter_id=*', {
//         statusCode: 200,
//         body: { total_applicants: 3 },
//       }).as('getApplicants');
  
//       cy.intercept('GET', '**/fetch-jobs', {
//         statusCode: 200,
//         body: [
//           { Title: 'Job A', applicantsnum: 2, views: 10 },
//           { Title: 'Job B', applicantsnum: 1, views: 4 },
//         ],
//       }).as('fetchJobs');
  
//       // ✅ Now that intercepts are in place, visit the page
//       cy.visit('http://localhost:3001/dashboard-recruiter');

//     });
  
//     it('should render recruiter stats from backend data', () => {
//       cy.wait('@getJobPostings');
//       cy.wait('@getApplicants');
//       cy.wait('@fetchJobs');
  
//       cy.contains('Total Job Postings: 5').should('be.visible');
//       cy.contains('Total Applications: 3').should('be.visible');
//       cy.contains('Avg. Views per Job: 7').should('be.visible');
//     });

//     it('should render job postings chart with correct labels', () => {
//       cy.contains('Job A').should('exist');
//       cy.contains('Job B').should('exist');
//       cy.get('canvas, svg, .recharts-bar-rectangle').should('exist');
//     });
  
//     it('should show empty state when no job data', () => {
//       cy.intercept('GET', '**/fetch-jobs**', {
//         statusCode: 200,
//         body: [],
//       }).as('emptyJobs');
  
//       cy.reload();
//       cy.wait('@emptyJobs');
//       cy.contains('Job Postings Stats').should('be.visible');
//       // You can optionally check that no bars are rendered
//     });
  
//     it('should handle backend errors gracefully', () => {
//       cy.intercept('GET', '**/numjobpostings**', {
//         statusCode: 500,
//         body: { error: 'Server error' },
//       }).as('jobPostingsFail');
  
//       cy.reload();
//       cy.wait('@jobPostingsFail');
//       cy.contains('Total Job Postings:').should('exist'); // Still renders but fallback state
//       // Check console errors if needed (optional)
//     });
  
//     it('should log out and navigate to login page', () => {
//       cy.contains('Logout').click();
//       cy.url().should('include', '/login');
//     });
//   });
  