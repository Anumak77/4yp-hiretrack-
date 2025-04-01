describe('Recruiter Job Postings Flow', () => {

    beforeEach(() => {
      cy.visit('/login');
      cy.get('input#email-address').type('rec@gmail.com');
      cy.get('input#password').type('recrec');
      cy.get('button.login-button').click();
      cy.url().should('include', '/dashboard-recruiter');
    });
  
    it('Should navigate to View Job Postings', () => {
      cy.contains('View Job Postings').click();
      cy.wait(5000); 
      cy.url().should('include', '/viewjobpostings');
      cy.contains('Job Postings');
    });
  
    it('Should capture job title and go to applicants page, validate title matches', () => {
        
      cy.contains('View Job Postings').click();
      cy.url().should('include', '/viewjobpostings');
      cy.contains('Job Postings');
      
  
      cy.get('.vj-card-title').first().invoke('text').then((jobTitle) => {
        const trimmedTitle = jobTitle.trim();
  
        cy.get('.vj-btn.view').first().click();
        cy.url().should('include', '/viewapplicants');
        cy.contains('Applicants for Job ID');
  
        cy.go('back');
        cy.get('.vj-card-title').first().should('have.text', trimmedTitle);
      });
    });
  
    it('Should go to Edit Job, change title, and save successfully', () => {

                
      cy.contains('View Job Postings').click();
      cy.url().should('include', '/viewjobpostings');
      cy.contains('Job Postings');

  
      cy.get('.vj-btn.edit').first().click();
      cy.url().should('include', '/edit-job');
  
      const newTitle = 'Updated Job Title Cypress';
      cy.get('input[name="Title"]').clear().type(newTitle);
      cy.get('button.post-job-button').click();
  
      cy.url().should('include', '/dashboard-recruiter');
    });
  
    it('Should open delete confirmation but cancel it', () => {

        
      cy.contains('View Job Postings').click();
      cy.url().should('include', '/viewjobpostings');
      cy.contains('Job Postings');  
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });
  
      cy.get('.vj-btn.delete').first().click();
      cy.get('.vj-card-title').should('exist');
    });

    it('Should post a new job with incrementing title', () => {
        cy.contains('Post Job').click();
        cy.url().should('include', '/post-job');

        const testCountFile = 'cypress/fixtures/jobPostCount.json';

        cy.readFile(testCountFile).then((data) => {
            const currentCount = data.count || 0;
            const newCount = currentCount + 1;
            const newTitle = `Test Job ${newCount}`;

            cy.get('input[name="Title"]').type(newTitle);
            cy.get('input[name="Company"]').type('Test Company');
            cy.get('textarea[name="AboutC"]').type('About test company');
            cy.get('select[name="Location"]').select('United States');
            cy.get('textarea[name="JobDescription"]').type('Test job description');
            cy.get('textarea[name="JobRequirment"]').type('Test requirements');
            cy.get('textarea[name="RequiredQual"]').type('Test qualifications');
            cy.get('textarea[name="ApplicationP"]').type('Test application process');
            
            const today = new Date().toISOString().split('T')[0];
            cy.get('input[name="OpeningDate"]').type(today);
            cy.get('input[name="Deadline"]').type(today);
            
            cy.get('button.post-job-button').click();
            
            cy.get('.confirm-button').click();
            
            cy.url().should('include', '/dashboard-recruiter');
            cy.contains('Job Posted Successfully!').should('exist');
            
            cy.writeFile(testCountFile, { count: newCount });
        }).catch(() => {
            cy.writeFile(testCountFile, { count: 1 });
            cy.reload(); 
        });
     });
  
  });
  