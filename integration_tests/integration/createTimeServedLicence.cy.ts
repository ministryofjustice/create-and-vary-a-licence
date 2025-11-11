import TimeServedConfirmCreatePage from '../pages/timeServedConfirmCreate'

context('Create a Time Served licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonUserCaseloads', {
      details: [
        {
          caseLoadId: 'LEI',
          caseloadFunction: 'GENERAL',
          currentlyActive: true,
          description: 'Leeds (HMP)',
          type: 'INST',
        },
      ],
    })
    cy.task('stubGetCaseloadItemInHardStop')
    cy.task('stubFeComponents')
    cy.task('stubPostLicence')
    cy.task('stubGetPrisons')
    cy.task('stubGetPrisonOmuCaseload')
    cy.signIn()
  })

  it('should click through the create a licence journey', () => {
    cy.visit('/licence/time-served/create/nomisId/A1234AA/do-you-want-to-create-the-licence-on-this-service')
    const confirmCreatePage = new TimeServedConfirmCreatePage()
    confirmCreatePage.selectRadio('Yes')
    confirmCreatePage.clickContinueButton()
    cy.url().should('eq', 'http://localhost:3007/licence/view/cases')
  })
})
