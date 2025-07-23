import moment from 'moment'
import Page from '../pages/page'
import IndexPage from '../pages'
import ChangeLocationPage from '../pages/changeLocationPage'
import ViewCasesPage from '../pages/viewCasesPage'
import ViewALicencePage from '../pages/viewALicence'

context('View and print licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPrisonSignIn')
    cy.task('stubGetPrisonUserDetails')
    cy.task('stubGetPrisonOmuCaseload')
    cy.task('stubGetProbationOmuCaseload')
    cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
    cy.task('stubGetProbationers')
    cy.task('searchPrisonersByNomisIds')
    cy.task('searchPrisonersByReleaseDate')
    cy.task('stubGetStaffDetailsByList')
    cy.task('stubGetStaffDetailsByStaffCode')
    cy.task('stubGetCompletedLicence', {
      statusCode: 'APPROVED',
      typeCode: 'AP_PSS',
      electronicMonitoringProvider: { isToBeTaggedForProgramme: true, programmeName: 'EM' },
      electronicMonitoringProviderStatus: 'COMPLETE',
    })
    cy.task('stubGetHdcStatus')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetPrisons')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
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
    viewCasesList.clickFutureReleasesTab()
    const comDetails = viewCasesList.clickComDetails()
    viewCasesList = comDetails.clickReturn()
    viewCasesList.clickFutureReleasesTab()
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
    cy.get('[data-qa=no-match-message]').contains('No licences to display')
  })

  it('should allow prison CAs to change initial appointment information in the hard-stop window', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.task('stubGetLicenceInHardStop')
    cy.task('stubSearchForAddresses')
    cy.task('stubPutLicenceAppointmentPerson')
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    const viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickFutureReleasesTab()
    let viewLicencePage: ViewALicencePage = viewCasesList.clickALicence()
    viewLicencePage = viewLicencePage.clickChangePersonLink().enterPerson('Joe Bloggs').clickContinueToReturn()
    viewLicencePage = viewLicencePage
      .clickChangeAddressLink()
      .enterAddressOrPostcode('123 Fake St')
      .findAddress()
      .selectAddress()
      .clickContinueToReturn()
    viewLicencePage = viewLicencePage.clickChangeTelephoneLink().enterTelephone('00000000000').clickContinueToReturn()
    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      viewLicencePage = viewLicencePage
        .clickChangeDateLink()
        .selectTypeInHardStop('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinueToReturn()
      viewLicencePage = viewLicencePage
        .clickChangeTimeLink()
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinueToReturn()
    })
  })

  it('should populate electronic monitoring additional information', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickFutureReleasesTab()
    const comDetails = viewCasesList.clickComDetails()
    viewCasesList = comDetails.clickReturn()
    viewCasesList.clickFutureReleasesTab()
    const viewLicencePage = viewCasesList.clickALicence()
    viewLicencePage.checkElectronicMonitoringAdditionalInformationExists()
  })

  it('should not populate electronic monitoring additional information', () => {
    cy.task('stubGetPrisonUserCaseloads', singleCaseload)
    cy.task('stubGetCompletedLicence', {
      statusCode: 'APPROVED',
      typeCode: 'AP_PSS',
    })
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    let viewCasesList = indexPage.clickViewAndPrintALicence()
    viewCasesList.clickFutureReleasesTab()
    const comDetails = viewCasesList.clickComDetails()
    viewCasesList = comDetails.clickReturn()
    viewCasesList.clickFutureReleasesTab()
    const viewLicencePage = viewCasesList.clickALicence()
    viewLicencePage.checkIfElectronicMonitoringAdditionalInformationDoesNotExist()
  })
})
