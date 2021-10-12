import nock from 'nock'
import config from '../config'
import LicenceService from '../services/licenceService'
import HmppsAuthClient from './hmppsAuthClient'
import BespokeCondition from '../routes/creatingLicences/types/bespokeConditions'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import {
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

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const licenceService = new LicenceService(hmppsAuthClient, null, null)

describe('Licence API client tests', () => {
  let fakeApi: nock.Scope
  const username = 'joebloggs'

  beforeEach(() => {
    config.apis.licenceApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.licenceApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
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
  })

  describe('Update licence status', () => {
    const statusUpdateRequest = { status: LicenceStatus.SUBMITTED, username } as StatusUpdateRequest

    it('should call the PUT endpoint to update the licence status', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.put('/licence/id/1/status', statusUpdateRequest).reply(200)
      await licenceService.updateStatus('1', LicenceStatus.SUBMITTED, username)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
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
      const statusUpdateRequest = { status: LicenceStatus.APPROVED, username } as StatusUpdateRequest
      it('Update the licence to APPROVED', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/status', statusUpdateRequest).reply(200)
        await licenceService.updateStatus('1', LicenceStatus.APPROVED, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })

    describe('Rejected', () => {
      const statusUpdateRequest = { status: LicenceStatus.REJECTED, username } as StatusUpdateRequest
      it('Update the licence to REJECTED', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.put('/licence/id/1/status', statusUpdateRequest).reply(200)
        await licenceService.updateStatus('1', LicenceStatus.REJECTED, username)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      })
    })
  })

  describe('Get licences for approval', () => {
    describe('List licences for approval in my prison caseload', () => {
      const prisonCaseload = ['LEI', 'MDI']
      it('Get approval cases in my prison caseload', async () => {
        hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
        fakeApi.get('/licence/approval-candidates?prison=LEI&prison=MDI').reply(200)
        await licenceService.getLicencesForApproval(username, prisonCaseload)
        expect(nock.isDone()).toBe(true)
        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
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
