import BespokeConditionsQuestionPage from './bespokeConditionsQuestion'
import Page from './page'

export default class PathfinderDetailsQuestionPage extends Page {
  private yesRadioButtonId = '[value=Yes]'

  private noRadioButtonId = '[value=No]'

  private continueButtonId = '[data-qa=continue]'

  constructor() {
    super('pathfinder-details-question-page', false)
  }

  selectYes = (): PathfinderDetailsQuestionPage => {
    cy.get(this.yesRadioButtonId).click()
    return this
  }

  selectNo = (): PathfinderDetailsQuestionPage => {
    cy.get(this.noRadioButtonId).click()
    return this
  }

  clickContinueWithError = (): PathfinderDetailsQuestionPage => {
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(PathfinderDetailsQuestionPage)
  }

  clickContinue = (): BespokeConditionsQuestionPage => {
    cy.visit('/licence/create/id/1/bespoke-conditions-question')
    cy.get(this.continueButtonId).click()
    return Page.verifyOnPage(BespokeConditionsQuestionPage)
  }

  getErrorSummary = () => {
    return cy.get('.govuk-error-summary__body')
  }

  enterProgrammeName = (text: string): PathfinderDetailsQuestionPage => {
    cy.get('#programmeName').type(text)
    return this
  }
}
