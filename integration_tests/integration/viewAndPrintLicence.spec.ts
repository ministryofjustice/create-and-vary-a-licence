import Page from '../pages/page'
import IndexPage from '../pages'
import ChangeLocationPage from '../pages/changeLocationPage'
import ViewCasesPage from '../pages/viewCasesPage'

context('View and print licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
    cy.task('stubGetOffendersByNomsNumber')
    cy.task('searchPrisonersByNomisIds')
    cy.task('searchPrisonersByReleaseDate')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.task('stubGetCompletedLicence', 'APPROVED')
    cy.task('stubGetHdcStatus')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisons')
  })
  const singleCaseload = {
    details: [
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
      },
    ],
  }
  const multipleCaseloads = {
    details: [
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'MDI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
        description: 'Moorland (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'BXI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
        description: 'Brixton (HMP)',
        type: 'INST',
      },
    ],
  }

  it('should click through the view and print a licence journey', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    const comDetails = viewCasesList.clickComDetails()
    viewCasesList = comDetails.clickReturn()
    const viewLicencePage = viewCasesList.clickALicence()
    const printALicencePage = viewLicencePage.printALicence()
    printALicencePage.checkPrintTemplate()
  })

  it("should not show caseload information because doesn't have multiple caseloads", () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.getChangeCaseloadOption().should('not.exist')
  })

  it('should allow user to change caseload', () => {
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.getChangeCaseloadOption().should('exist')
    viewCasesList.getCaseloadNames().contains('Leeds (HMP)')
    viewCasesList.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickCheckBox('Moorland')
    changeLocationPage.clickContinue()
    viewCasesList.getCaseloadNames().contains('Leeds (HMP), Moorland (HMP)')
    viewCasesList.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
  })

  it('change caseload cancel link should return user to their original view', () => {
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCancelLink()
    cy.url().should('eq', 'http://localhost:3007/licence/view/cases')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
    viewCasesList.clickLinkWithDataQa('probation-view-link')
    viewCasesList.clickChangeLocationsLink()
    changeLocationPage.clickCancelLink()
    cy.url().should('eq', 'http://localhost:3007/licence/view/cases?view=probation')
  })

  it('change caseload continue button should return user to their original view', () => {
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickContinue()
    cy.url().should('eq', 'http://localhost:3007/licence/view/cases')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
    viewCasesList.clickLinkWithDataQa('probation-view-link')
    viewCasesList.clickChangeLocationsLink()
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickContinue()
    cy.url().should('eq', 'http://localhost:3007/licence/view/change-location?view=probation')
  })

  it('Should display errors if Continue without selecting any checkbox', () => {
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickContinue()
    changeLocationPage.getErrorSummary().should('exist')
  })
  it('verify prison and probation views only display licences with appropriate statuses', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    Page.verifyOnPage(ViewCasesPage)
    viewCasesList.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
    viewCasesList.getRow(0).contains('Approved')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'ACTIVE' })
    viewCasesList.clickLinkWithDataQa('probation-view-link')
    viewCasesList.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
    viewCasesList.getRow(0).contains('Active')
    viewCasesList.clickLinkWithDataQa('prison-view-link')
    cy.get('[data-qa=no-match-message]').contains('There are no licences to print which match the search criteria.')
  })
})
