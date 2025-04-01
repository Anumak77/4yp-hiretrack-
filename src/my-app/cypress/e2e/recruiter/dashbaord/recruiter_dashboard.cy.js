describe('Recruiter Dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input#email-address').type('rec@gmail.com');
    cy.get('input#password').type('recrec');
    cy.get('button.login-button').click();
    cy.url().should('include', '/dashboard-recruiter');
  });

  it('loads the dashboard with dynamic stats and charts', () => {
    cy.get('.recruiter-insight-card').should('have.length.at.least', 1);

    cy.get('.recruiter-insight-card').each(($card) => {
      cy.wrap($card).invoke('text').should('match', /\d+/); 
    });

    cy.get('.recruiter-chart-container h3').should('contain', 'Job Postings Stats');
    
    cy.get('.recruiter-chart-container canvas')
      .should('be.visible')
      .and((canvas) => {
        expect(canvas[0].clientWidth).to.be.greaterThan(0);
        expect(canvas[0].clientHeight).to.be.greaterThan(0);
      });

    cy.intercept('GET', 'http://localhost:5000/fetch-jobs*').as('getJobs');
    cy.wait('@getJobs').then((interception) => {
      const jobsData = interception.response.body;
    });
  });

  it('Can Log-out', () => {
    cy.get('.dashboard-recruiter-sidebar > :nth-child(5)').click()
    cy.url().should('include', '/login');  
  });
});