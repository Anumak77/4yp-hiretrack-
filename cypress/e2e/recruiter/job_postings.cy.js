describe('Recruiter Job Postings Flow', () => {
n 
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input#email-address').type('recruiter@gmail.com');
      cy.get('input#password').type('recruiter');
      cy.get('button.login-button').click();
      cy.url().should('include', '/dashboard-recruiter');
      cy.get('.dashboard-recruiter-container > .navbar > .nav-menu > :nth-child(2) > .nav-link').click();
    });
  
    it('Should navigate to View Job Postings', () => {
        cy.intercept('GET', '**/fetch-jobs').as('fetchJobs');
        cy.url().should('include', '/viewjobpostings');
        cy.wait('@fetchJobs');
        cy.contains('Job Postings').should('be.visible');
      });
      
  
      it('Should capture job title and go to applicants page, validate title matches', () => {
        cy.intercept('GET', '**/fetch-applicants/**').as('fetchApplicants');
        cy.url().should('include', '/viewjobpostings');
        cy.contains('Job Postings');

        cy.get('.vj-card-title').first().invoke('text').then((jobTitle) => {
          const trimmedTitle = jobTitle.trim();
          cy.get('.vj-btn.view').first().click();
          cy.url().should('include', '/viewapplicants');
          cy.wait('@fetchApplicants').its('response.statusCode').should('eq', 200);
          cy.contains('Applicants for Job ID').should('exist');
          cy.go('back');
          cy.get('.vj-card-title').first().invoke('text').should('eq', trimmedTitle);
        });
      });
      
  
      it('Should go to Edit Job, change title, and save successfully', () => {

        cy.intercept('GET', '**/fetch_job/**').as('fetchJob');
        cy.url().should('include', '/viewjobpostings');
        cy.contains('Job Postings');
        cy.get('.vj-btn.edit').first().click();
        cy.wait('@fetchJob').its('response.statusCode').should('eq', 200);
        cy.url().should('include', '/edit-job');

        const newTitle = 'Updated Job Title Cypress';

        cy.get('input[name="Title"]').clear().type(newTitle);
        cy.get('button.post-job-button').click();
        cy.url().should('include', '/edit-job');
        cy.get('input[name="Title"]').should('have.value', newTitle);
      });
      
  
    it('Should open delete confirmation but cancel it', () => {

      cy.url().should('include', '/viewjobpostings');
      cy.contains('Job Postings');  
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });
  
      cy.get('.vj-btn.delete').first().click();
      cy.get('.vj-card-title').should('exist');
    });

    it('Should confirm delete and remove the job from list', () => {
        cy.intercept('DELETE', '**/delete-job/**').as('deleteJob');
        Cypress.on('window:confirm', () => true); 
        cy.url().should('include', '/viewjobpostings');
        cy.contains('Job Postings');
        cy.get('.vj-card-title').first().invoke('text').then((deletedTitle) => {
          cy.get('.vj-btn.delete').first().click();
        });
      });     
  
  });
  
