import Page from '../pages/page'
import IndexPage from '../pages'
import ChangeLocationPage from '../pages/changeLocationPage'
import ApproveCasesPage from '../pages/approvalCases'

context('Approve a licence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubAuthUser')
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

    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP_PSS' })
    cy.task('stubGetLicencesForStatus', 'SUBMITTED')
    cy.task('stubGetOffendersByNomsNumber')
    cy.task('searchPrisonersByNomisIds')
    cy.task('stubUpdateLicenceStatus', 1)
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisons')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubGetStaffDetailByUsername')
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

  it('should click through the approve a licence journey', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickAccordionToShowAll()
    const confirmApprovePage = approvalViewPage.clickApprove()
    const approvalCasesPage2 = confirmApprovePage.clickReturnToList()
    approvalCasesPage2.signOut().click()
  })

  it('should redirect to approve case page on return to list click', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickAccordionToShowAll()
    const approvalCasesPage2 = approvalViewPage.clickReturnToList()
    approvalCasesPage2.getTableRows().should(rows => {
      expect(rows).to.have.length(1)
    })
  })

  it('should check if review details accordian is open', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickAccordionToShowAll()
    approvalViewPage.getHideAllSection().should('exist')
  })

  it('should display Approve licence heading if licence is of type AP', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickAccordionToShowAll()
    approvalViewPage.getValue(approvalViewPage.approveLicenceId).should('have.text', 'Approve licence')
    approvalViewPage
      .getValue(approvalViewPage.accordionSectionHeading)
      .should('contain.text', 'Additional licence conditions')
  })

  it('should display Approve licence and post sentence supervision order heading if licence is of type AP_PSS', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP_PSS' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickAccordionToShowAll()
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
    approvalViewPage.clickAccordionToShowAll()
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
    cy.task('stubGetPrisonerImage')
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickAccordionToShowAll()
    approvalViewPage.getPrisonerImage().should('have.class', 'prisoner-image')
  })

  it('should get missing prisoner image', () => {
    cy.task('stubGetCompletedLicence', { statusCode: 'SUBMITTED', typeCode: 'AP' })
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    const approvalCasesPage = indexPage.clickApproveALicence()
    const approvalViewPage = approvalCasesPage.clickApproveLicence()
    approvalViewPage.clickAccordionToShowAll()
    approvalViewPage.getPrisonerMissingImageId().should('have.class', 'prisoner-missing-image')
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
})
