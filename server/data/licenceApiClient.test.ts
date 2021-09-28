import nock from 'nock'
import config from '../config'
import LicenceService from '../services/licenceService'
import HmppsAuthClient from './hmppsAuthClient'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import {
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  ContactNumberRequest,
  LicenceApiTestData,
} from './licenceApiClientTypes'
import PersonName from '../routes/creatingLicences/types/personName'
import Telephone from '../routes/creatingLicences/types/telephone'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const licenceService = new LicenceService(hmppsAuthClient)

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
  })
})
