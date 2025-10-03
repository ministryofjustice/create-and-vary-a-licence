import moment from 'moment'
import Page from '../pages/page'
import IndexPage from '../pages'

const MEZ_CONDITION_CODE = '0f9a20f4-35c7-4c77-8af8-f200f153fa11'

context('Create a licence', () => {
  const dates: string[] = []

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubProbationSignIn')
    cy.task('stubGetStaffDetails')
    cy.task('stubGetEmptyLicence')
    cy.task('stubSearchForAddresses')
    cy.task('stubGetStaffPreferredAddresses')
    cy.task('stubPutLicenceAppointmentPerson')
    cy.task('stubRecordAuditEvent')
    cy.task('stubGetLicencePolicyConditions')
    cy.task('stubGetActivePolicyConditions')
    cy.task('stubGetBankHolidays', dates)
    cy.task('stubAddAdditionalCondition')
    cy.task('stubFeComponents')
    cy.task('stubPostExclusionZone')
    cy.signIn()
  })

  it('should add an exclusion zone to the licence', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition(MEZ_CONDITION_CODE)
        .clickContinueToMez()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .uploadFile()
        .clickContinueForMez([
          {
            id: 1,
            code: 'abc123',
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
        ])
        .selectNo()
        .clickContinue()

      const pssConditionsQuestionPage = bespokeConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const checkAnswersPage = pssConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })

  it('should add multiple exclusion zones to the licence', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition(MEZ_CONDITION_CODE)
        .clickContinueToMez()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .uploadFile()
        .clickContinueForMez([
          {
            id: 1,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
        ])
        .selectYes()
        .clickContinueCallbackLoop()
        .uploadFile()
        .clickContinueForMez([
          {
            id: 1,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
          {
            id: 2,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 1,
            data: [
              { id: 2, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 1, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 2, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 2 },
            ],
            readyToSubmit: true,
          },
        ])
        .selectNo()
        .clickContinue()

      const pssConditionsQuestionPage = bespokeConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const checkAnswersPage = pssConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })

  it('should remove an exclusion zone from the licence', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition(MEZ_CONDITION_CODE)
        .clickContinueToMez()

      const exclusionZoneMapList = additionalConditionsInputPage
        .uploadFile()
        .clickContinueForMez([
          {
            id: 1,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
        ])
        .selectYes()
        .clickContinueCallbackLoop()
        .uploadFile()
        .clickContinueForMez([
          {
            id: 1,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
          {
            id: 2,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 1,
            data: [
              { id: 2, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 1, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 2, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 2 },
            ],
            readyToSubmit: true,
          },
        ])
        .clickDeleteLink()
        .selectYes()
        .clickContinueCallbackLoop()

      cy.task('stubGetCompletedLicence', {
        statusCode: 'IN_PROGRESS',
        typeCode: 'AP_PSS',
        isInHardStopPeriod: false,
        kind: 'CRD',
        appointmentTelephoneNumber: '01234567890',
        appointmentAlternativeTelephoneNumber: '01234567892',
        conditions: [
          {
            id: 1,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
        ],
      })

      const bespokeConditionsQuestionPage = exclusionZoneMapList.selectNo().clickContinue()

      const pssConditionsQuestionPage = bespokeConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const checkAnswersPage = pssConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })

  it('should delete all exclusion zones from the licence', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    const caseloadPage = indexPage.clickCreateALicence()
    const confirmCreatePage = caseloadPage.clickNameToCreateLicence()

    const appointmentPersonPage = confirmCreatePage.clickContinue()
    const appointmentPlacePage = appointmentPersonPage.enterPerson('Duty Officer').clickContinue()
    const selectAddressPage = appointmentPlacePage.enterAddressOrPostcode('123 Fake Street').findAddress()
    const appointmentContactPage = selectAddressPage.selectAddress().clickContinue()

    const appointmentTimePage = appointmentContactPage.enterTelephone('012345678', '012345679').clickContinue()

    cy.task('getNextWorkingDay', dates).then(appointmentDate => {
      const additionalConditionsPage = appointmentTimePage
        .selectType('SPECIFIC_DATE_TIME')
        .enterDate(moment(appointmentDate))
        .enterTime(moment())
        .clickContinue()
        .selectYes()
        .clickContinue()

      const additionalConditionsInputPage = additionalConditionsPage
        .selectCondition(MEZ_CONDITION_CODE)
        .clickContinueToMez()

      const bespokeConditionsQuestionPage = additionalConditionsInputPage
        .uploadFile()
        .clickContinueForMez([
          {
            id: 1,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
        ])
        .selectYes()
        .clickContinueCallbackLoop()
        .uploadFile()
        .clickContinueForMez([
          {
            id: 1,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 0,
            data: [
              { id: 1, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 0, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 1, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 1 },
            ],
            readyToSubmit: true,
          },
          {
            id: 2,
            code: MEZ_CONDITION_CODE,
            version: '3.0',
            category: 'Freedom of movement',
            sequence: 1,
            data: [
              { id: 2, field: 'outOfBoundsFilename', value: 'test_map.pdf', sequence: 1, contributesToLicence: true },
            ],
            uploadSummary: [
              { id: 2, filename: 'test_map.pdf', fileSize: 1, uploadedTime: new Date().toString(), uploadDetailId: 2 },
            ],
            readyToSubmit: true,
          },
        ])
        .clickDeleteCondition()

      cy.task('stubGetCompletedLicence', {
        statusCode: 'IN_PROGRESS',
        typeCode: 'AP_PSS',
        isInHardStopPeriod: false,
        kind: 'CRD',
        conditions: [],
        appointmentTelephoneNumber: '01234567890',
        appointmentAlternativeTelephoneNumber: '01234567892',
      })

      const pssConditionsQuestionPage = bespokeConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const checkAnswersPage = pssConditionsQuestionPage.selectNo().clickContinueAfterNo()

      const confirmationPage = checkAnswersPage.clickSendLicenceConditionsToPrison()
      const caseloadPageExit = confirmationPage.clickReturn()
      caseloadPageExit.signOut().click()
    })
  })
})
