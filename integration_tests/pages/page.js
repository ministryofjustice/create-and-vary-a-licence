module.exports = (name, pageObject = {}, axeTest = true) => {
  if (axeTest) {
    cy.injectAxe()
    cy.checkA11y()
  }

  const checkOnPage = () => cy.get('h1').contains(name) || cy.get('title').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage, logout }
}
