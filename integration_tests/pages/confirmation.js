const page = require('./page')

const confirmationPage = () =>
  page('Confirmation', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
  })

module.exports = { verifyOnPage: confirmationPage }
