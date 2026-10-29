import IndexPage from '../pages'
import Page from '../pages/page'

context('View COM create caseload', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAll', [
      'stubProbationSignIn',
      'stubGetStaffDetails',
      ['stubGetLicence', {}],
      'stubGetOmuEmail',
      ['stubGetBankHolidays', dates],
      'stubCheckComCaseAccess',
      'stubGetProbationCase',
    ])
    cy.signIn()
  })

  it('should navigate to the com create caseload page and display offender details', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicence(true)
    cy.get('#name-1 .caseload-offender-name a').should('exist')
    cy.get('#name-1 .caseload-offender-name').should('contain', 'Test Person')
    cy.get('#release-date-1').should('contain', '1 Sep 2024')
    cy.get('#licence-status-1 .status-badge').should('exist')
    cy.get('#licence-status-1 .status-badge').should('contain', 'Not started')
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()
    caseloadPage = confirmCreatePage.clickReturnToCaseload()
    caseloadPage.signOut().click()
  })

  it('should navigate to the com create caseload page and display LAO case restrictions', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicenceWithLao()
    caseloadPage.getRow(0).within(() => {
      cy.get('#name-1 .caseload-offender-name a').should('exist')
      cy.get('#name-1 .caseload-offender-name').should('contain', 'Test Person')
      cy.get('#release-date-1').should('contain', '1 Sep 2024')
      cy.get('#licence-status-1 .status-badge').should('exist')
      cy.get('#licence-status-1 .status-badge').should('contain', 'Not started')
    })
    caseloadPage.getRow(1).within(() => {
      cy.get('#name-2 .caseload-offender-name a').should('exist')
      cy.get('#name-2 .caseload-offender-name').should('contain', 'Access Restricted in NDelius')
      cy.get('#release-date-2').should('contain', 'Restricted')
      cy.get('#licence-status-2 .status-badge').should('not.exist')
      cy.get('#licence-status-2').should('contain', 'Restricted')
    })
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()
    caseloadPage = confirmCreatePage.clickReturnToCaseload()
    caseloadPage.signOut().click()
  })

  it('The LAO restrictions should navigate to the restricted details page', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicenceWithLao()

    const restrictedDetailsPage = caseloadPage.clickRestrictedName()
    restrictedDetailsPage
      .getRestrictedDetails()
      .contains('This record has been restricted due to sensitive information')
  })

  it('should show the opted-out HDC interrupt and continue to the replacement licence', () => {
    cy.task('stubGetLicence', { isReplacementForOptedOutLicence: true })
    cy.task('stubRecordAuditEvent')

    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicenceWithHdcReplacement({
      isReplacementForOptedOutLicence: true,
    })

    let optOutInterruptPage = caseloadPage.clickNameOfOptedOutLicence()
    optOutInterruptPage.getInterruptMessage().should('contain', 'This person has opted out of HDC')
    optOutInterruptPage.getInterruptMessage().should('contain', 'This licence is now for a standard release.')

    caseloadPage = optOutInterruptPage.clickReturnToCaseload()
    optOutInterruptPage = caseloadPage.clickNameOfOptedOutLicence()
    const checkAnswersPage = optOutInterruptPage.clickContinue()

    checkAnswersPage
      .getReplacementInfo()
      .should('contain', 'Any additional or bespoke conditions you entered previously will be saved.')
      .and('contain', 'You must enter any initial appointment details again and then submit the licence.')
  })

  it('should show the refused HDC interrupt and continue to the replacement licence', () => {
    cy.task('stubGetLicence', { isReplacementForRefusedLicence: true })
    cy.task('stubRecordAuditEvent')

    const indexPage = Page.verifyOnPage(IndexPage)
    let caseloadPage = indexPage.clickCreateALicenceWithHdcReplacement({
      isReplacementForRefusedLicence: true,
    })
    let refusedInterruptPage = caseloadPage.clickNameOfRefusedLicence()

    refusedInterruptPage.getInterruptMessage().should('contain', 'HDC application refused')
    refusedInterruptPage.getInterruptMessage().should('contain', 'This licence is now for a standard release.')

    caseloadPage = refusedInterruptPage.clickReturnToCaseload()
    refusedInterruptPage = caseloadPage.clickNameOfRefusedLicence()
    const checkAnswersPage = refusedInterruptPage.clickContinue()

    checkAnswersPage
      .getReplacementInfo()
      .should('contain', 'Any additional or bespoke conditions you entered previously will be saved.')
      .and('contain', 'You must enter any initial appointment details again and then submit the licence.')
  })

  it('should block the replacement licence when HDC address checks are incomplete', () => {
    cy.task('stubGetHdcLicence', {
      kind: 'HDC',
      statusCode: 'IN_PROGRESS',
      isReplacementForOptedInLicence: true,
      hdcAddressChecksComplete: false,
    })

    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.clickCreateALicenceWithHdcReplacement({})

    cy.get('#name-button-1').click()
    cy.get('#hdc-opt-in-interrupt-page-heading').should('contain', 'This person has opted in to HDC')
    cy.contains('You must complete the address checks in HDC before you can continue with this licence in CVL.')
    cy.get('.refused-interrupt__actions a.govuk-button').should('not.exist')
    cy.contains('.refused-interrupt__actions a', 'Return to case list').should(
      'have.attr',
      'href',
      '/licence/create/caseload',
    )
  })

  it('should show the postponed HDC interrupt with OMU contact details', () => {
    cy.task('stubGetHdcLicence', { kind: 'HDC', statusCode: 'IN_PROGRESS', isPostponed: true })

    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.clickCreateALicenceWithHdcReplacement({ isHdcPostponed: true })

    cy.get('#name-button-1').click()
    cy.get('#hdc-postponed-interrupt-page-heading').should('contain', 'HDC application postponed')
    cy.contains('Contact test@test.test to ask for the application to be refused')
    cy.get('.postponed-interrupt__button').should(
      'have.attr',
      'href',
      '/licence/create/id/1/check-your-answers?continueAfterHdcInterrupt=true',
    )
  })
})
