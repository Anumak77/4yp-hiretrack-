describe('Post Job Form', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input#email-address').type('rec@gmail.com');
      cy.get('input#password').type('recrec');
      cy.get('button.login-button').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard-recruiter');
      cy.contains('Post a Job').click();
    });
  
 
  
    it('shows an error message for incorrect or missing fields', () => {
      cy.get('button[type="submit"]').click();
    });
      
    it('allows cancelling a job post via the confirmation modal', () => {
      cy.get('input[name="Title"]').type('Senior Developer');
      cy.get('input[name="Company"]').type('Tech Innovations Inc.');
      cy.get('textarea[name="AboutC"]').type('An innovative technology company.');
      cy.get('.location-dropdown').select('United States');
      cy.get('textarea[name="JobDescription"]').type('Develop cutting-edge applications.');
      cy.get('textarea[name="JobRequirment"]').type('Must have 5+ years of experience.');
      cy.get('textarea[name="RequiredQual"]').type('Bachelor\'s degree in Computer Science.');
      cy.get('textarea[name="ApplicationP"]').type('Submit through our web portal.');
      cy.get('input[name="Deadline"]').type('2023-02-01');
      cy.get('input[name="StartDate"]').type('2023-03-01');
      cy.get('button[type="submit"]').click();
      cy.get('.confirmation-modal').should('be.visible');
      cy.get('.cancel-button').click();
    });
  
  
  });
  
  