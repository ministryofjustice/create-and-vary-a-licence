import Page from '../pages/page'
import IndexPage from '../pages'
import ChangeLocationPage from '../pages/changeLocationPage'
import ApproveCasesPage from '../pages/approvalCases'

context('Approve a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP_PSS' })
    cy.task('stubGetApprovalCaseload')
    cy.task('stubUpdateLicenceStatus', 1)
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisons')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetStaffDetails')
    cy.task('stubFeComponents')
  })

  const singleCaseload = {
    details: [
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
        probationPractitioner: {
          staffCode: 'P9876',
          name: 'Alice Brown',
        },
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

  it('should click through the approve a licence journey', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    const confirmApprovePage = approvalViewPage.clickApprove()
    const approvalCasesPage2 = confirmApprovePage.clickReturnToList()
    approvalCasesPage2.signOut().click()
  })

  it('should redirect to approve case page on return to list click', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickApproveLicence()
    cy.url().should('eq', 'http://localhost:3007/licence/approve/id/1/view')
  })

  it('should check if review details accordion is open', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.getHideAllSection().should('exist')
  })

  it('should display Approve licence heading if licence is of type AP', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.getValue(approvalViewPage.approveLicenceId).should('have.text', 'Approve licence')
    approvalViewPage
      .getValue(approvalViewPage.accordionSectionHeading)
      .should('contain.text', 'Additional licence conditions')
  })

  it('should display Licence conditions heading if licence kind is HARD_STOP', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP', kind: 'HARD_STOP' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.getValue(approvalViewPage.approveLicenceId).should('have.text', 'Approve licence')
    approvalViewPage.getValue(approvalViewPage.accordionSectionHeading).should('contain.text', 'Licence conditions')
  })

  it('should display HDC content if licence kind is HDC', () => {
    cy.task('stubGetCompletedLicence', {
      statusCode: 'SUBMITTED',
      typeCode: 'AP',
      kind: 'HDC',
      homeDetentionCurfewActualDate: '09/09/2023',
      homeDetentionCurfewEndDate: '12/03/2021',
    })
    cy.task('stubGetHdcLicenceData')
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.getValue(approvalViewPage.approveLicenceId).should('have.text', 'Approve licence')
    approvalViewPage.getValue(approvalViewPage.accordionSectionHeading).should('contain.text', 'HDC and licence dates')
    approvalViewPage.getValue(approvalViewPage.releaseDateHeading).should('contain.text', 'Release date/HDC start date')
    approvalViewPage.getValue(approvalViewPage.hdcEndDate).should('contain.text', '12 March 2021')
    approvalViewPage.getValue(approvalViewPage.conditionalReleaseDate).should('contain.text', '13 March 2021')
    approvalViewPage.getValue(approvalViewPage.accordionSectionHeading).should('contain.text', 'HDC curfew details')
    approvalViewPage
      .getValue(approvalViewPage.curfewAddress)
      .should('contain.text', '1 The Street, Avenue, Some Town, Some County, A1 2BC')
    approvalViewPage.getValue(approvalViewPage.firstNightCurfewHours).should('contain.text', '5pm to 7am')
    approvalViewPage.getValue(approvalViewPage.curfewHours).should('contain.text', 'Monday to Sunday')
    approvalViewPage.getValue(approvalViewPage.curfewHours).should('contain.text', '5pm to 7am')
  })

  it('should display Approve licence and post sentence supervision order heading if licence is of type AP_PSS', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP_PSS' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage
      .getValue(approvalViewPage.approveLicenceAndPssId)
      .should('have.text', 'Approve licence and post sentence supervision order')
    approvalViewPage
      .getValue(approvalViewPage.accordionSectionHeading)
      .should('contain.text', 'Additional licence conditions')
  })

  it('should display Approve post sentence supervision order heading if licence is of type PSS', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'PSS' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage
      .getValue(approvalViewPage.approvePssId)
      .should('have.text', 'Approve post sentence supervision order')
    approvalViewPage
      .getValue(approvalViewPage.accordionSectionHeading)
      .should('contain.text', 'Additional post sentence supervision requirements')
  })

  it('should get prisoner image', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.getPrisonerImage().should('have.class', 'prisoner-image')
  })

  it("should not show caseload information because user doesn't have multiple caseloads", () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.getChangeCaseloadOption().should('not.exist')
  })

  it('should allow user to change caseload', () => {
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.getChangeCaseloadOption().should('exist')
    approvalCasesPage.getCaseloadNames().contains('Leeds (HMP)')
    approvalCasesPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCheckBox('Leeds')
    changeLocationPage.clickCheckBox('Moorland')
    changeLocationPage.clickContinue()
    approvalCasesPage.getCaseloadNames().contains('Leeds (HMP), Moorland (HMP)')
    approvalCasesPage.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
  })

  it('cancel should return user to cases page', () => {
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickCancelForApprover()
    Page.verifyOnPage(ApproveCasesPage)
    approvalCasesPage.getCaseloadNames().contains('Leeds (HMP)')
    approvalCasesPage.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
  })

  it('should display errors if Continue without selecting any checkbox', () => {
    cy.task('stubGetPrisonUserCaseloads', multipleCaseloads)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.clickChangeLocationsLink()
    const changeLocationPage = Page.verifyOnPage(ChangeLocationPage)
    changeLocationPage.clickContinue()
    changeLocationPage.getErrorSummary().should('exist')
  })

  it('should show recently approved successfully', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.task('stubGetRecentlyApprovedCaseload')
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const recentlyApprovedPage = approvalCasesPage.clickRecentlyApprovedLink()
    recentlyApprovedPage.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
  })

  it('should show correct default sort icons on tabs', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.task('stubGetRecentlyApprovedCaseload')
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.checkColumnSortIcon('Release date', 'ascending')
    approvalCasesPage.clickRecentlyApprovedLink()
    approvalCasesPage.checkColumnSortIcon('Approved on', 'descending')
    approvalCasesPage.checkColumnSortIcon('Release date', 'none')
    approvalCasesPage.signOut().click()
  })

  it('should show correct probation practitioner on approval cases page', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.hasProbationPractitioner(1, 'Joe Bloggs')
    approvalCasesPage.signOut().click()
  })

  it('should show Not allocated when probation practitioner not found on approval cases page', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.task('stubGetApprovalCaseload', { probationPractitioner: null })
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    approvalCasesPage.hasProbationPractitioner(1, 'Not allocated')
    approvalCasesPage.signOut().click()
  })
})
