describe('Job Tracker Recruiter', () => {
    before(() => {
      cy.session('user-login', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input#email-address').type('recruiter@gmail.com');
        cy.get('input#password').type('recruiter');
        cy.get('button.login-button').click();
      });
    });
  
    beforeEach(() => {
      cy.visit('/dashboard-recruiter');
      cy.get('.view-job-button').click();
      cy.wait(2000);
    });
  
    it('should render the chart with proper dimensions after adding data', () => {
      cy.get('.job-option-button').first().click();
      cy.get('input[placeholder="Enter Month (e.g., January)"]').type('March');
      cy.get('input[placeholder="Applications Count"]').type('200');
      cy.get('.job-tracker__form > :nth-child(10)').click();
  
      cy.get('.job-tracker__chart').should('be.visible');
      cy.get('.job-tracker__chart canvas')
        .should('be.visible')
        .and(($canvas) => {
          expect($canvas.width()).to.be.greaterThan(0);
          expect($canvas.height()).to.be.greaterThan(0);
          const canvas = $canvas[0];
          const context = canvas.getContext('2d');
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
          const hasContent = imageData.some(channel => channel !== 0);
          expect(hasContent).to.be.true;
        });
    });
  
    it('should update chart when adding multiple months data', () => {
      const months = ['January', 'February', 'March'];
      
      months.forEach(month => {
        cy.get('.job-option-button').first().click();
        cy.get('input[placeholder="Enter Month (e.g., January)"]').type(month);
        cy.get('input[placeholder="Applications Count"]').type('100');
        cy.get('.job-tracker__form > :nth-child(10)').click();
      });
  
      cy.get('.job-tracker__chart canvas')
        .should(($canvas) => {
          const canvas = $canvas[0];
          const context = canvas.getContext('2d');
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
          expect(imageData.some(channel => channel !== 0)).to.be.true;
        });
    });
  
    it('should maintain chart when switching between job types', () => {
      cy.get('.job-option-button').first().click();
      cy.get('input[placeholder="Enter Month (e.g., January)"]').type('January');
      cy.get('input[placeholder="Applications Count"]').type('100');
      cy.get('.job-tracker__form > :nth-child(10)').click();
  
      cy.get('.job-option-button').eq(1).click();
      cy.get('input[placeholder="Enter Month (e.g., January)"]').type('February');
      cy.get('input[placeholder="Applications Count"]').type('150');
      cy.get('.job-tracker__form > :nth-child(10)').click();
  
      cy.get('.job-tracker__chart canvas')
        .should(($canvas) => {
          const canvas = $canvas[0];
          const context = canvas.getContext('2d');
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
          expect(imageData.some(channel => channel !== 0)).to.be.true;
        });
    });
  
    it('should show an error if required fields are missing', () => {
      cy.get('.job-option-button').first().click();
      cy.get('.job-tracker__form > :nth-child(10)').click();
      cy.get('.error-message').should('be.visible');
    });
  });
  