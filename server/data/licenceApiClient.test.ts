import nock from 'nock'
import config from '../config'
import LicenceService from '../services/licenceService'
import HmppsAuthClient from './hmppsAuthClient'
import BespokeCondition from '../routes/creatingLicences/types/bespokeConditions'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import {
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  BespokeConditionsRequest,
  ContactNumberRequest,
  LicenceApiTestData,
  StatusUpdateRequest,
} from '../@types/licenceApiClientTypes'
import PersonName from '../routes/creatingLicences/types/personName'
import Telephone from '../routes/creatingLicences/types/telephone'
import { stringToAddressObject } from '../utils/utils'
import LicenceStatus from '../enumeration/licenceStatus'
import AdditionalConditions from '../routes/creatingLicences/types/additionalConditions'
import * as conditionsProvider from '../utils/conditionsProvider'
import LicenceType from '../enumeration/licenceType'

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const licenceService = new LicenceService(hmppsAuthClient, null, null)
const additionalCondition = { code: 'condition1', text: 'text', category: 'category' }

jest.spyOn(conditionsProvider, 'getAdditionalConditionByCode').mockReturnValue(additionalCondition)
jest.mock('./hmppsAuthClient')

describe('Licence API client tests', () => {
  let fakeApi: nock.Scope
  const username = 'joebloggs'

  beforeEach(() => {
    config.apis.licenceApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.licenceApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.clearAllMocks()
  })

  describe('Test data', () => {
    const stubbedTestData: LicenceApiTestData[] = [{ key: 'X', value: 'Y' } as LicenceApiTestData]

    it('Get test data', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/test/data', '').reply(200, stubbedTestData)
      const data = await licenceService.getTestData(username)
      expect(data).toEqual(stubbedTestData)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('No client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.get('/test/data', '').reply(401)
      try {
        await licenceService.getTestData(username)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Empty data', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/test/data', '').reply(200, [])
      const data = await licenceService.getTestData(username)
      expect(data).toEqual([])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })

  describe('Licence creation stages', () => {
    describe('Who to meet', () => {
      const person = { contactName: 'Fred' } as PersonName
      const appointmentPersonRequest = { appointmentPerson: person.contactName } as AppointmentPersonRequest

      it('Update the person to meet', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/appointmentPerson', appointmentPersonRequest).reply(200)
        await licenceService.updateAppointmentPerson('1', person, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('When to meet', () => {
      const appointmentTimeRequest = { appointmentTime: '12/12/2022 11:15' } as AppointmentTimeRequest
      const simpleDate = new SimpleDate('12', '12', '2022')
      const simpleTime = new SimpleTime('11', '15', AmPm.AM)
      const simpleDateTime = SimpleDateTime.fromSimpleDateAndTime(simpleDate, simpleTime)

      it('Update the date and time of the appointment', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/appointmentTime', appointmentTimeRequest).reply(200)
        await licenceService.updateAppointmentTime('1', simpleDateTime, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Where to meet', () => {
      const appointmentAddressRequest = {
        appointmentAddress: 'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN',
      } as AppointmentAddressRequest
      const address = stringToAddressObject(appointmentAddressRequest.appointmentAddress)

      it('Update the date and time of the appointment', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/appointment-address', appointmentAddressRequest).reply(200)
        await licenceService.updateAppointmentAddress('1', address, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Officer contact number', () => {
      const contactNumberRequest = { comTelephone: '0114 2556556' } as ContactNumberRequest
      const telephoneContact = new Telephone()
      telephoneContact.telephone = '0114 2556556'

      it('Update the officer contact telephone number', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/contact-number', contactNumberRequest).reply(200)
        await licenceService.updateContactNumber('1', telephoneContact, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Bespoke conditions', () => {
      it('No bespoke conditions entered', async () => {
        const formConditions = makeFormBespokeConditions([])
        const apiRequestConditions = makeApiRequestBespokeConditions([])
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/bespoke-conditions', apiRequestConditions).reply(200)
        await licenceService.updateBespokeConditions('1', formConditions, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })

      it('Three bespoke conditions entered', async () => {
        const formConditions = makeFormBespokeConditions(['C1', 'C2', 'C3'])
        const apiRequestConditions = makeApiRequestBespokeConditions(formConditions.conditions)
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/bespoke-conditions', apiRequestConditions).reply(200)
        await licenceService.updateBespokeConditions('1', formConditions, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })

      it('Remove empty bespoke conditions', async () => {
        const formConditions = makeFormBespokeConditions(['C1', '', '', 'C4'])
        const apiRequestConditions = makeApiRequestBespokeConditions(['C1', 'C4'])
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/bespoke-conditions', apiRequestConditions).reply(200)
        await licenceService.updateBespokeConditions('1', formConditions, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Additional conditions', () => {
      it('No additional conditions entered', async () => {
        const formConditions = new AdditionalConditions()
        const apiRequestConditions = makeApiRequestAdditionalConditions(
          formConditions.additionalConditions,
          LicenceType.AP
        )
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/additional-conditions', apiRequestConditions).reply(200)
        await licenceService.updateAdditionalConditions('1', LicenceType.AP, formConditions, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })

      it('Three additional conditions entered', async () => {
        const formConditions = new AdditionalConditions()
        formConditions.additionalConditions = ['condition1', 'condition2', 'condition3']
        const apiRequestConditions = makeApiRequestAdditionalConditions(
          formConditions.additionalConditions,
          LicenceType.AP
        )
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/additional-conditions', apiRequestConditions).reply(200)
        await licenceService.updateAdditionalConditions('1', LicenceType.AP, formConditions, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })

      it('Update additional condition data from object', async () => {
        const form = {
          input1: 'testData1',
          input2: 'testData2',
        }
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi
          .put('/licence/id/1/additional-conditions/condition/1', {
            data: [
              {
                field: 'input1',
                value: 'testData1',
                sequence: 0,
              },
              {
                field: 'input2',
                value: 'testData2',
                sequence: 1,
              },
            ],
          })
          .reply(200)
        await licenceService.updateAdditionalConditionData('1', '1', form, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })
  })

  describe('Caseload information', () => {
    it('should make request to get licences by staff ID for any status', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/licence/staffId/2000').reply(200)
      await licenceService.getLicencesByStaffIdAndStatus(2000, username, [])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('should make request to get licences by staff ID for a single status', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/licence/staffId/2000?status=ACTIVE').reply(200)
      await licenceService.getLicencesByStaffIdAndStatus(2000, username, [LicenceStatus.ACTIVE])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('should make request to get licences by staff ID for multiple statuses', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/licence/staffId/2000?status=ACTIVE&status=INACTIVE').reply(200)
      await licenceService.getLicencesByStaffIdAndStatus(2000, username, [LicenceStatus.ACTIVE, LicenceStatus.INACTIVE])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })

  describe('Licence status updates', () => {
    describe('Approved', () => {
      const statusUpdateRequest = {
        status: LicenceStatus.APPROVED,
        username,
        fullName: 'Joe Bloggs',
      } as StatusUpdateRequest

      it('Update the licence to APPROVED', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/status', statusUpdateRequest).reply(200)
        await licenceService.updateStatus('1', LicenceStatus.APPROVED, username, 'Joe Bloggs')
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Rejected', () => {
      const statusUpdateRequest = { status: LicenceStatus.REJECTED, username, fullName: null } as StatusUpdateRequest
      it('Update the licence to REJECTED', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/status', statusUpdateRequest).reply(200)
        await licenceService.updateStatus('1', LicenceStatus.REJECTED, username, null)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })
  })

  describe('Get licences for approval', () => {
    describe('Licences for approval in my prison caseload', () => {
      const prisonCaseload = ['LEI', 'MDI']
      it('Get approval cases in my prison caseload', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.get('/licence/match?prison=LEI&prison=MDI&status=SUBMITTED').reply(200)
        await licenceService.getLicencesForApproval(username, prisonCaseload)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Licences for approval with a CADM_I (central admin) caseload only', () => {
      const prisonCaseload = ['CADM_I']
      it('Get approval cases in my prison caseload', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.get('/licence/match?status=SUBMITTED').reply(200)
        await licenceService.getLicencesForApproval(username, prisonCaseload)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('List licences for approval with a CADM_I and others in caseload', () => {
      const prisonCaseload = ['MDI', 'CADM_I']
      it('Get approval cases in my prison caseload', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.get('/licence/match?prison=MDI&status=SUBMITTED').reply(200)
        await licenceService.getLicencesForApproval(username, prisonCaseload)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })
  })

  describe('Get licences for view and print', () => {
    describe('Prison user caseload', () => {
      const prisons = ['LEI', 'MDI']
      const authSource = 'nomis'
      it('Get licences in prison caseload', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi
          .get('/licence/match?prison=LEI&prison=MDI&status=ACTIVE&status=APPROVED&status=REJECTED&status=SUBMITTED')
          .reply(200)
        await licenceService.getLicencesForCaseAdmin(username, authSource, prisons)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Prison user with CADM_I (central admin) caseload', () => {
      const prisons = ['CADM_I']
      const authSource = 'nomis'
      it('Get licences with central caseload', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.get('/licence/match?status=ACTIVE&status=APPROVED&status=REJECTED&status=SUBMITTED').reply(200)
        await licenceService.getLicencesForCaseAdmin(username, authSource, prisons)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Probation user - filters by staffId', () => {
      const prisons: string[] = []
      const authSource = 'delius'
      const staffId = 123
      it('Get licences by probation staff id', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi
          .get('/licence/match?staffId=123&status=ACTIVE&status=APPROVED&status=REJECTED&status=SUBMITTED')
          .reply(200)
        await licenceService.getLicencesForCaseAdmin(username, authSource, prisons, staffId)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Auth user - always empty for now', () => {
      const prisons: string[] = []
      const authSource = 'auth'
      it('Get licences - does not call out so returns an empty list', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.get('/licence/match?status=ACTIVE&status=APPROVED&status=REJECTED&status=SUBMITTED').reply(200)
        await licenceService.getLicencesForCaseAdmin(username, authSource, prisons)
        expect(nock.isDone()).toBe(false)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalledTimes(0)
      })
    })
  })
})

const makeFormBespokeConditions = (conditions: string[]): BespokeCondition => {
  const formConditions = new BespokeCondition()
  formConditions.conditions = conditions
  return formConditions
}

const makeApiRequestBespokeConditions = (conditions: string[]): BespokeConditionsRequest => {
  return { conditions } as BespokeConditionsRequest
}

const makeApiRequestAdditionalConditions = (
  conditionIds: string[],
  conditionType: string
): AdditionalConditionsRequest => {
  const expectedConditions =
    conditionIds?.map((conditionCode, index) => {
      return {
        code: conditionCode,
        sequence: index,
        category: additionalCondition.category,
        text: additionalCondition.text,
      }
    }) || []

  return { additionalConditions: expectedConditions, conditionType } as AdditionalConditionsRequest
}
