import Page from './page'
import CaseloadPage from './caseload'
import CheckAnswersPage from './checkAnswers'

export default class RefusedInterruptPage extends Page {
  constructor() {
    super('hdc-refused-interrupt-page')
  }

  getInterruptMessage = () => cy.get('.moj-interruption-card')

  clickContinue = (): CheckAnswersPage => {
    cy.get('.refused-interrupt__button').click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickReturnToCaseload = (): CaseloadPage => {
    cy.contains('.refused-interrupt__actions a', 'Return to case list').click()
    return Page.verifyOnPage(CaseloadPage)
  }
}
