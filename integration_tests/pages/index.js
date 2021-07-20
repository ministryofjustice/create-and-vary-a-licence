const page = require('./page')

const indexPage = () =>
  page('Create and vary a licence', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
  })

module.exports = { verifyOnPage: indexPage }
