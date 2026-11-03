import Page from './page'
import CaseloadPage from './caseload'
import CheckAnswersPage from './checkAnswers'

export default class OptOutInterruptPage extends Page {
  constructor() {
    super('hdc-opt-out-interrupt-page')
  }

  getInterruptMessage = () => cy.get('.moj-interruption-card')

  clickContinue = (): CheckAnswersPage => {
    cy.get('.opt-out-interrupt__button').click()
    return Page.verifyOnPage(CheckAnswersPage)
  }

  clickReturnToCaseload = (): CaseloadPage => {
    cy.contains('.opt-out-interrupt__actions a', 'Return to case list').click()
    return Page.verifyOnPage(CaseloadPage)
  }
}
