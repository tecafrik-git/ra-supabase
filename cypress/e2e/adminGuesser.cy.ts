import { login } from './login';

const getPaginationText = () =>
    cy.findByText(/\d+-\d+ of \d+/, { timeout: 10000 });

describe('AdminGuesser', () => {
    it('should render one menu item per resource', () => {
        cy.visit('/');
        login();
        cy.findByText('Companies').should('exist');
        cy.findByText('Contacts').should('exist');
        cy.findByText('Deals').should('exist');
        cy.findByText('Tags').should('exist');
        cy.findByText('Tasks').should('exist');
        cy.findByText('Dealnotes').should('exist');
        cy.findByText('Contactnotes').should('exist');
        cy.findByText('Sales').should('exist');
    });
});
