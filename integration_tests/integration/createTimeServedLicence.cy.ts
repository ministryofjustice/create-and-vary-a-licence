import IndexPage from '../pages'
import Page from '../pages/page'

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
    cy.task('stubGetPrisonOmuCaseload', {
      licenceId: null,
      licenceStatus: 'TIMED_OUT',
      tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
      hardStopKind: 'TIME_SERVED',
      hasNomisLicence: false,
    })
    cy.task('stubUpdateTimeServedExternalRecord')
    cy.task('stubGetTimeServedExternalRecordReasonNotSet')
    cy.signIn()
  })

  it('should click through the create a licence journey', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    const releaseDateFlag = viewCasesList.getReleaseDateFlag()
    releaseDateFlag.should('contain', 'Time-served release')
    const confirmCreatePage = viewCasesList.clickATimeServedLicence()
    confirmCreatePage.selectRadio('Yes')
    viewCasesList = confirmCreatePage.clickContinueButtonToReturn()
    viewCasesList.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
    viewCasesList.getRow(0).contains('Time-served release')
    viewCasesList.getRow(0).contains('In progress')
  })

  it('should record a reason for using NOMIS to create a time served licence', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    const releaseDateFlag = viewCasesList.getReleaseDateFlag()
    releaseDateFlag.should('contain', 'Time-served release')
    const confirmCreatePage = viewCasesList.clickATimeServedLicence()
    confirmCreatePage.selectRadio('No')
    confirmCreatePage.enterNoReasonText('This is a reason for using NOMIS')
    viewCasesList = confirmCreatePage.clickContinueButtonToReturn()
    viewCasesList.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
    viewCasesList.getRow(0).contains('Time-served release')
    viewCasesList.getRow(0).contains('NOMIS licence')
  })

  it('should prepopulate a reason for using NOMIS to create a time served licence if one already exists and then allow user to update', () => {
    cy.task('stubGetTimeServedExternalRecordReasonSet')
    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    const releaseDateFlag = viewCasesList.getReleaseDateFlag()
    releaseDateFlag.should('contain', 'Time-served release')
    let confirmCreatePage = viewCasesList.clickATimeServedLicence()
    confirmCreatePage.selectRadio('No')
    confirmCreatePage.enterNoReasonText('This is a reason for using NOMIS')
    confirmCreatePage.clickContinueButtonToReturn()
    confirmCreatePage = viewCasesList.clickATimeServedLicence()
    confirmCreatePage.getRadioCreateOnNomisSelection().should('have.value', 'No')
    confirmCreatePage.getNoReasonText().should('have.value', 'This is a reason for using NOMIS')
    confirmCreatePage.enterNoReasonText('This is an updated reason for using NOMIS')
    viewCasesList = confirmCreatePage.clickContinueButtonToReturn()
    viewCasesList.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
    viewCasesList.getRow(0).contains('Time-served release')
    viewCasesList.getRow(0).contains('NOMIS licence')
  })

  it('should show validation error when no option is selected', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const releaseDateFlag = viewCasesList.getReleaseDateFlag()
    releaseDateFlag.should('contain', 'Time-served release')
    const confirmCreatePage = viewCasesList.clickATimeServedLicence()
    confirmCreatePage.clickContinueButtonToError()
    confirmCreatePage.getErrorMessage().should('contain.text', 'Choose how you will create this licence')
  })

  it('should show validation error when no option is selected and a reason is not entered', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    const releaseDateFlag = viewCasesList.getReleaseDateFlag()
    releaseDateFlag.should('contain', 'Time-served release')
    const confirmCreatePage = viewCasesList.clickATimeServedLicence()
    confirmCreatePage.selectRadio('No')
    confirmCreatePage.clickContinueButtonToError()
    confirmCreatePage.getErrorMessage().should('contain.text', 'You must add a reason for using NOMIS')
  })
})
