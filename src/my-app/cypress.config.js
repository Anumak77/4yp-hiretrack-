const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Look for any files ending in `.cy.js` inside `my-app/cypress/e2e/`
    specPattern: 'cypress/e2e/**/*.cy.js', 
    baseUrl: 'http://localhost:3000',
    supportFile: false
  }
});

