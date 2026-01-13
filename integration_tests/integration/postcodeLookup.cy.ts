import Page from '../pages/page'
import IndexPage from '../pages'
import ViewALicencePage from '../pages/viewALicence'
import { LicenceKind, LicenceStatus } from '../../server/enumeration'

context('Postcode lookup', () => {
  describe('Postcode Lookup - COM', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubProbationSignIn')
      cy.task('stubGetStaffDetails')
      cy.task('stubGetLicence', {})
      cy.task('stubSearchForAddresses')
      cy.task('stubPutLicenceAppointmentPerson')
      cy.task('stubGetLicencePolicyConditions')
      cy.task('stubGetActivePolicyConditions')
      cy.task('stubFeComponents')
      cy.task('stubPostProbationLicence')
      cy.signIn()
    })

    it('should display the postcode lookup search page with a preferred address available', () => {
      cy.task('stubGetStaffPreferredAddresses')
      const indexPage = Page.verifyOnPage(IndexPage)
      let caseloadPage = indexPage.clickCreateALicence()
      const comDetailsPage = caseloadPage.clickComName()
      caseloadPage = comDetailsPage.clickReturnToCaseload()
      const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

      const appointmentPersonPage = confirmCreatePage.clickContinue()
      const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
      appointmentPlacePage.useSavedAddressField().should('exist')
      appointmentPlacePage.getAddressNotSavedMessage().should('not.exist')
      appointmentPlacePage.deleteAddressLink().should('exist')
      const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
      selectAddressPage.selectAddress()
      selectAddressPage.addPreferredAddressCheckbox().should('exist')
    })

    it('should display the postcode lookup search page without a preferred address', () => {
      cy.task('stubGetStaffNoPreferredAddresses')
      const indexPage = Page.verifyOnPage(IndexPage)
      let caseloadPage = indexPage.clickCreateALicence()
      const comDetailsPage = caseloadPage.clickComName()
      caseloadPage = comDetailsPage.clickReturnToCaseload()
      const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

      const appointmentPersonPage = confirmCreatePage.clickContinue()
      const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
      appointmentPlacePage.useSavedAddressField().should('exist')
      appointmentPlacePage.getAddressNotSavedMessage().should('exist')
      appointmentPlacePage.deleteAddressLink().should('not.exist')
      const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
      selectAddressPage.selectAddress()
      selectAddressPage.addPreferredAddressCheckbox().should('exist')
    })

    it('should display Select an address error message', () => {
      cy.task('stubGetStaffPreferredAddresses')
      const indexPage = Page.verifyOnPage(IndexPage)
      let caseloadPage = indexPage.clickCreateALicence()
      const comDetailsPage = caseloadPage.clickComName()
      caseloadPage = comDetailsPage.clickReturnToCaseload()
      const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

      const appointmentPersonPage = confirmCreatePage.clickContinue()
      const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
      appointmentPlacePage.useSavedAddressField().should('exist')
      appointmentPlacePage.getAddressNotSavedMessage().should('not.exist')
      appointmentPlacePage.deleteAddressLink().should('exist')
      appointmentPlacePage.useThisAddressBtnClick()
      appointmentPlacePage.errorListSummary().should('exist').and('contain.text', 'Select an address')
    })
  })

  describe('Postcode Lookup Hardstop - CA', () => {
    const dates: string[] = []

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
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubPrisonSignIn')
      cy.task('stubGetPrisonUserDetails')
      cy.task('stubGetPrisonOmuCaseload')
      cy.task('stubGetProbationOmuCaseload')
      cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
      cy.task('stubGetProbationers')
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
      cy.task('stubGetStaffPreferredAddresses')
      cy.task('stubFeComponents')
      cy.task('stubPostPrisonLicence')
      cy.task('stubGetPrisonUserCaseloads', singleCaseload)
      cy.task('stubPutLicenceAppointmentPerson')
      cy.signIn()
    })

    it('should display the postcode lookup search page without a preferred address', () => {
      cy.task('stubGetPrisonOmuCaseload', {
        licenceId: null,
        licenceStatus: LicenceStatus.TIMED_OUT,
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        kind: LicenceKind.TIME_SERVED,
        hasNomisLicence: false,
      })
      cy.task('stubRecordAuditEvent')
      cy.task('stubGetLicence', { licenceKind: LicenceKind.TIME_SERVED })
      cy.task('stubSubmitStatus')
      cy.task('stubAddTimeServedProbationConfirmContact')
      cy.task('stubGetStaffNoPreferredAddresses')
      cy.task('stubGetCaseloadItemInHardStop')
      cy.task('stubPostProbationLicence')
      const indexPage = Page.verifyOnPage(IndexPage)
      const viewCasesList = indexPage.clickViewAndPrintALicence()
      const confirmCreatePage = viewCasesList.clickATimeServedLicence()
      confirmCreatePage.selectRadio('Yes')
      const appointmentPersonPage = confirmCreatePage.clickContinue()
      appointmentPersonPage.selectAppointmentPersonType(2)
      const appointmentPlacePage = appointmentPersonPage.enterPerson('Test officer').clickContinue()
      appointmentPlacePage.getAddressNotSavedMessage().should('exist')
    })

    it('should display the postcode lookup search page with a preferred address available in the hard-stop window', () => {
      cy.task('stubGetLicenceInHardStop')
      cy.task('stubSearchForAddresses')

      const indexPage = Page.verifyOnPage(IndexPage)
      const viewCasesList = indexPage.clickViewAndPrintALicence()
      viewCasesList.clickFutureReleasesTab()
      let viewLicencePage: ViewALicencePage = viewCasesList.clickALicence()
      viewLicencePage = viewLicencePage.clickChangePersonLink().enterPerson('Joe Bloggs').clickContinueToReturn()
      const appointmentPlacePage = viewLicencePage
        .clickChangeAddressLink()
        .enterFirstLine('123 Fake St')
        .enterSecondLine('Apt 4B')
        .enterTownOrCity('Faketown')
        .enterCounty('Fakesbury')
        .enterPostcode('FA1 1KE')
        .findAnAddressBtnClick()

      appointmentPlacePage.useSavedAddressField().should('exist')
      appointmentPlacePage.deleteAddressLink().should('exist')
      appointmentPlacePage.getAddressNotSavedMessage().should('not.exist')
      const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
      selectAddressPage.selectAddress()
      selectAddressPage.addPreferredAddressCheckbox().should('exist')
    })
  })

  const postcodesToTest = [
    { postcode: 'FA1 1E', shouldShowError: true, expectedError: 'Enter a valid postcode' },
    { postcode: 'EC1A1BB', shouldShowError: false },
    { postcode: 'abc', shouldShowError: true, expectedError: 'Postcode must be at least 5 characters' },
    { postcode: 'NE661234LX', shouldShowError: true, expectedError: 'Postcode must be at most 8 characters' },
    { postcode: 'NE66 1LX', shouldShowError: false },
    { postcode: 'CF2 35AG', shouldShowError: false },
  ]

  describe('Appointment postcode validation', () => {
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

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubPrisonSignIn')
      cy.task('stubGetPrisonUserDetails')
      cy.task('stubGetPrisonOmuCaseload')
      cy.task('stubGetLicencesForOffender', { nomisId: 'G9786GC', status: 'APPROVED' })
      cy.task('stubGetCompletedLicence', {
        statusCode: 'APPROVED',
        typeCode: 'AP_PSS',
        electronicMonitoringProvider: { isToBeTaggedForProgramme: true, programmeName: 'EM' },
        electronicMonitoringProviderStatus: 'COMPLETE',
      })
      cy.task('stubGetHdcStatus')
      cy.task('stubRecordAuditEvent')
      cy.task('stubGetPrisons')
      cy.task('stubFeComponents')
      cy.task('stubGetPrisonUserCaseloads', singleCaseload)
      cy.task('stubGetLicenceInHardStop')
      cy.task('stubPutLicenceAppointmentPerson')
      cy.signIn()
    })

    postcodesToTest.forEach(({ postcode, shouldShowError, expectedError }) => {
      it(`should ${shouldShowError ? '' : 'not '}display an error for postcode: ${postcode}`, () => {
        const indexPage = Page.verifyOnPage(IndexPage)
        const viewLicencePage = indexPage.clickViewAndPrintALicence().clickFutureReleasesTab().clickALicence()

        const appointmentPlacePage = viewLicencePage.clickChangeAddressLink().enterPostcode(postcode)

        if (shouldShowError) {
          appointmentPlacePage.clickContinueForErrorMessage()
          appointmentPlacePage.getPostcodeError().should('contain.text', expectedError)
        } else {
          appointmentPlacePage.clickContinueToReturn()
        }
      })
    })
  })
})
