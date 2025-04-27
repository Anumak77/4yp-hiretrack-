describe('Recruiter Dashboard', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input#email-address').type('rec@gmail.com');
      cy.get('input#password').type('recrec');
      cy.get('button.login-button').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard-recruiter');
    });
  
    it('loads the dashboard with dynamic stats and charts', () => {
      cy.get('.recruiter-insight-card').should('have.length.at.least', 1);
  
      cy.get('.recruiter-insight-card').each(($card) => {
        cy.wrap($card).invoke('text').should('match', /\d+/); 
      });
  
      cy.get('.recruiter-chart-container h3').should('contain', 'Job Postings Stats');
      cy.intercept('GET', 'http://localhost:5000/fetch-jobs*').as('getJobs');

    });
  
    it('Can Log-out', () => {
      cy.get('.dashboard-recruiter-sidebar > :nth-child(5)').click()
      cy.url().should('include', '/login');  
    });

    it('All Buttons are Visible', () => {
      cy.contains('Post a Job').should('exist');
      cy.contains('Job Tracker').should('exist');
      cy.contains('Inbox').should('exist');
      cy.contains('Logout').should('exist');
    });

  });