const page = require('./page')

const indexPage = () =>
  page('Welcome', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
  })

module.exports = { verifyOnPage: indexPage }
