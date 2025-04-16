const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    
    defaultCommandTimeout: 15000, 
    pageLoadTimeout: 60000,
    responseTimeout: 30000,
    requestTimeout: 5000,
    
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true,
    
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    
    setupNodeEvents(on, config) {
      return config;
    }
  },
});