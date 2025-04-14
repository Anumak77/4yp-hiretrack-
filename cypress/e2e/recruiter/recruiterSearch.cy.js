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
      cy.get('.job-search-input').type('Alice');
      cy.get('.job-table tbody tr').should('have.length.gt', 0);
    });
  
    it('clicks "View Details" and verifies job seeker details', () => {
      cy.get('.job-table tbody tr:first-child .more-info-button').contains('View Details').click();
      cy.url().should('include', '/jobseeker-details');
      cy.contains('Name:').should('exist');
      cy.contains('Location:').should('exist');
      cy.contains('Industry:').should('exist');
      cy.contains('Experience:').should('exist');
      cy.get('.job-details__button').contains('Reach Out').click();
      cy.url().should('include', '/recruiterchat');
      cy.go('back'); 
    });
  
    it('clicks "View All Applied Jobs" and verifies applied jobs page', () => {
      cy.url().should('include', '/recruiter-search');
      cy.get('.job-table tbody tr:first-child .more-info-button').contains('View All Applied Jobs').click();
      cy.url().should('include', '/view-all-applied-jobs');
      cy.get('.view-applied-name').then(($name) => {
        const name = $name.text().trim();
        expect(name).not.to.be.empty;
      });
      cy.contains('Other Possible Jobs').should('exist');
      cy.get('.other-jobs-container .other-job-card').should('have.length.gt', 0);
    });
  });
