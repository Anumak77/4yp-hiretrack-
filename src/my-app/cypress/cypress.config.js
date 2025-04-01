const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Implement or require custom event listeners and tasks
    },
    specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',  // Updated spec pattern
    supportFile: './support/index.js',  // Adjusted path
    baseUrl: "http://localhost:3000", // Adjust based on your application's URL
  },
});
