describe('Recruiter Search Flow', () => {
    beforeEach(() => {
      cy.visit('/login');
      const email = 'rec@gmail.com';
      const password = 'recrec';
      cy.get('input#email-address').type(email);
      cy.get('input#password').type(password);
      cy.get('button.login-button').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard-recruiter');
      cy.get('.dashboard-recruiter-container > .navbar > .nav-menu > :nth-child(3) > .nav-link').click();

    });
  
    it('searches for job seekers', () => {
      cy.intercept('POST', 'http://127.0.0.1:5000/fetch-jobseekers').as('fetchJobseekers');

      cy.get('.job-search-input').type('Alice');
      cy.get('.job-table tbody tr').should('have.length.gt', 0);
    });
  
    it('clicks "View Details", sees info, reaches out, and views chat', () => {
      cy.intercept('GET', '**/get_recruiter_chats*').as('getChats');
      cy.intercept('GET', '**/get_chat_history*').as('getChatHistory');
    
      cy.get('.job-table tbody tr:first-child .more-info-button')
        .contains('View Details')
        .click();
    
      cy.url().should('include', '/jobseeker-details');
      cy.contains('Name:').should('exist');
      cy.contains('Location:').should('exist');
      cy.contains('Industry:').should('exist');
      cy.contains('Experience:').should('exist');
      cy.get('.job-details__button').contains('Reach Out').click();
      cy.url().should('include', '/recruiterchat');
      cy.wait('@getChats').its('response.statusCode').should('eq', 200);
      cy.wait('@getChatHistory').its('response.statusCode').should('eq', 200);
      cy.contains('Chat with').should('exist');
      cy.go('back');
    });
    
  
    it('clicks "View All Applied Jobs" and verifies applied jobs page', () => {
      cy.intercept('GET', '**/fetch-jobs').as('fetchJobs');
      cy.intercept('GET', '**/fetch-jobseeker-applied-jobs/**/appliedjobs').as('fetchAppliedJobs');
      cy.url().should('include', '/recruiter-search');
      cy.get('.job-table tbody tr:first-child .more-info-button')
        .contains('View All Applied Jobs')
        .click();
    
      cy.url().should('include', '/view-all-applied-jobs');
      cy.wait('@fetchAppliedJobs').its('response.statusCode').should('eq', 200);
      cy.wait('@fetchJobs').its('response.statusCode').should('eq', 200);
    
      cy.get('.view-applied-name').invoke('text').then((nameText) => {
        expect(nameText.trim()).to.not.be.empty;
      });
    
      cy.contains('Other Possible Jobs').should('exist');
      cy.get('.other-jobs-container .other-job-card').should('have.length.greaterThan', 0);
    });
    
  });
