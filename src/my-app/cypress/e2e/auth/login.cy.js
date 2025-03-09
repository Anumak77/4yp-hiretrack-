describe('Login Page', () => {
  
    it('should allow users to log in and redirect them correctly', () => {
      cy.visit('http://localhost:3000/login');
  
      const email = 'jobseeker@gmail.com';
      const password = 'jobseeker';
  
      cy.get('input#email-address').type(email);
      cy.get('input#password').type(password);
      cy.get('button.login-button').click();
  
      cy.wait(2000);
      cy.window().then((win) => {
        cy.wrap(win.localStorage.getItem('userRole')).should('exist');
      });
  
      cy.url().should('match', /dashboard-jobseeker|dashboard-recruiter|admin/);
    });
  
    it('should show an error message for incorrect credentials', () => {
      cy.visit('http://localhost:3000/login');
  
      cy.get('input#email-address').type('invaliduser@example.com');
      cy.get('input#password').type('wrongpassword');
      cy.get('button.login-button').click();
  
      cy.get('.login-error-text', { timeout: 5000 })
        .should('be.visible')
        .and('contain', 'Failed to log in. Please try again later.' || 'No user found');
    });
  
  });
  