const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // add custom event listeners here
    },
    specPattern: "./e2e/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:3000", // ensure this is your app's base URL
  },
});
