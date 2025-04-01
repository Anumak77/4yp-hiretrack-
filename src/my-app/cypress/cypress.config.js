const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
    },
    specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',  
    supportFile: './support/index.js',  
    baseUrl: "http://localhost:3000", 
  },
});
