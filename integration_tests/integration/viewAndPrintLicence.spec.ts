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

  it('should click through the view and print a licence journey', () => {
    const caseload = {
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
    cy.task('stubGetPrisonUserCaseloads', caseload)
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
    const caseload = {
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
    cy.task('stubGetPrisonUserCaseloads', caseload)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.getChangeCaseloadOption().should('not.exist')
  })
  it('should allow user to change caseload to view', () => {
    const caseload = {
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
    cy.task('stubGetPrisonUserCaseloads', caseload)
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

  it('cancel should return user to case page', () => {
    const caseload = {
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
    cy.task('stubGetPrisonUserCaseloads', caseload)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCancel()
    Page.verifyOnPage(ViewCasesPage)
    viewCasesList.getCaseloadNames().contains('Leeds (HMP)')
    viewCasesList.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
  })

  it('cancel should display errors', () => {
    const caseload = {
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
    cy.task('stubGetPrisonUserCaseloads', caseload)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickContinue()
    changeLocationPage.getErrorSummary().should('exist')
  })
})
