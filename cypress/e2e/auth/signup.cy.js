describe('Signup Page', () => {
  
    it('should allow users to sign up with a unique user', () => {
      cy.visit('/signup'); 
  
      const firstName = `User${Math.random().toString(36).substring(2, 6)}`;
      const lastName = `Test${Math.random().toString(36).substring(2, 6)}`;
      const email = `testuser_${Math.random().toString(36).substring(2, 8)}@example.com`;
      const password = 'Password123!';
  
      cy.log(` Signing up: ${firstName} ${lastName} | ${email}`);
  
      cy.get('input#first-name').type(firstName);
      cy.get('input#last-name').type(lastName);
      cy.get('input#email').type(email);
      cy.get('input#password').type(password);
  
      cy.get('input[name="userType"][value="Job Seeker"]').check();
  
      cy.get('select#location').select('United Kingdom');
  
      cy.get('input#phone').type('1234567890');
  
      cy.get('button.signup-button').click();
  
      cy.url().should('include', '/login');
  
      cy.get('.signup-error-text').should('not.exist');
    });
  
  });
