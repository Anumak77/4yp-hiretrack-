// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// ***********************************************************

import './commands'

beforeEach(() => {
    cy.log('Starting test: ' + Cypress.currentTest.title);
  });
  
  afterEach(() => {
    if (Cypress.currentTest.state === 'failed') {
      Cypress.runner.stop();
    }
  });