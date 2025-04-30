describe("Job Tracker Jobseeker", () => {
  beforeEach(() => {
    cy.visit("/jobtracker-jobseeker"); // Change path based on your router
  });

  it("displays the Job Tracker Dashboard title", () => {
    cy.contains("Job Tracker Dashboard").should("exist");
  });

  it("allows entering a due date", () => {
    cy.get(".input-date").type("2025-05-01").should("have.value", "2025-05-01");
  });

  it("allows changing job status", () => {
    cy.get(".jobtracker-status-button.interviewed").click().should("have.class", "active");
    cy.get(".jobtracker-status-button.rejected").click().should("have.class", "active");
  });

  it("adds a job application when fields are filled", () => {
    cy.get(".input-date").type("2025-05-02");
    cy.get(".jobtracker-add-button").click();
    cy.contains("Bar Chart - Applications Per Status").should("exist");
    cy.contains("Pie Chart - Job Status").should("exist");
  });

  it("shows Connect Google Calendar button if not connected", () => {
    cy.get(".google-connect-button").should("exist");
  });

  // Optional: Check that bar and pie charts render
  it("renders bar and pie charts", () => {
    cy.get(".jobtracker-bar-chart canvas").should("exist");
    cy.get(".jobtracker-pie-chart canvas").should("exist");
  });
});
