import faker from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  
  it("should allow you to register and login", () => {
    const signupForm = {
      name: `${faker.name.findName()}`,
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: signupForm.email })).as("user");

    cy.visit("/");
    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(signupForm.name);
    cy.findByRole("textbox", { name: /email/i }).type(signupForm.email);
    cy.findByLabelText(/password/i).type(signupForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByRole("link", { name: /notes/i }).click();
    cy.wait(3000);
    cy.findByRole("button", { name: /logout/i }).click();
    cy.findByRole("button", { name: /login/i });
  });

  it("should allow you to make a note", () => {
    const testNote = {
      title: faker.lorem.words(1),
      body: faker.lorem.sentences(1),
    };
    cy.login();
    cy.visit("/");

    cy.findByRole("link", { name: /notes/i }).click();
    cy.findByText("No notes yet");

    cy.findByRole("link", { name: /\+ new note/i }).click();

    cy.findByRole("textbox", { name: /title/i }).type(testNote.title);
    cy.findByRole("textbox", { name: /body/i }).type(testNote.body);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findByRole("button", { name: /delete/i }).click();

    cy.findByText("No notes yet");
  });
});
