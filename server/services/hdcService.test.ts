import HdcService from './hdcService'
import LicenceApiClient from '../data/licenceApiClient'
import { HdcLicenceData } from '../@types/licenceApiClientTypes'

jest.mock('../data/licenceApiClient')

describe('HDC Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const hdcService = new HdcService(licenceApiClient)

  const exampleHdcLicenceData = {
    curfewAddress: {
      addressLine1: 'addressLineOne',
      addressLine2: 'addressLineTwo',
      addressTown: 'addressTownOrCity',
      postCode: 'addressPostcode',
    },
    firstNightCurfewHours: {
      firstNightFrom: '09:00',
      firstNightUntil: '17:00',
    },
    curfewTimes: [
      {
        curfewTimesSequence: 1,
        fromDay: 'MONDAY',
        fromTime: { hour: 17, minute: 0, second: 0, nano: 0 },
        untilDay: 'TUESDAY',
        untilTime: { hour: 9, minute: 0, second: 0, nano: 0 },
      },
      {
        curfewTimesSequence: 2,
        fromDay: 'TUESDAY',
        fromTime: { hour: 17, minute: 0, second: 0, nano: 0 },
        untilDay: 'WEDNESDAY',
        untilTime: { hour: 9, minute: 0, second: 0, nano: 0 },
      },
      {
        curfewTimesSequence: 3,
        fromDay: 'WEDNESDAY',
        fromTime: { hour: 17, minute: 0, second: 0, nano: 0 },
        untilDay: 'THURSDAY',
        untilTime: { hour: 9, minute: 0, second: 0, nano: 0 },
      },
      {
        curfewTimesSequence: 4,
        fromDay: 'THURSDAY',
        fromTime: { hour: 17, minute: 0, second: 0, nano: 0 },
        untilDay: 'FRIDAY',
        untilTime: { hour: 9, minute: 0, second: 0, nano: 0 },
      },
      {
        curfewTimesSequence: 5,
        fromDay: 'FRIDAY',
        fromTime: { hour: 17, minute: 0, second: 0, nano: 0 },
        untilDay: 'SATURDAY',
        untilTime: { hour: 9, minute: 0, second: 0, nano: 0 },
      },
      {
        curfewTimesSequence: 6,
        fromDay: 'SATURDAY',
        fromTime: { hour: 17, minute: 0, second: 0, nano: 0 },
        untilDay: 'SUNDAY',
        untilTime: { hour: 9, minute: 0, second: 0, nano: 0 },
      },
      {
        curfewTimesSequence: 7,
        fromDay: 'MONDAY',
        fromTime: { hour: 17, minute: 0, second: 0, nano: 0 },
        untilDay: 'SUNDAY',
        untilTime: { hour: 9, minute: 0, second: 0, nano: 0 },
      },
    ],
  } as HdcLicenceData

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Get HDC information', () => {
    it('Should retrieve HDC information', async () => {
      licenceApiClient.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      const result = await hdcService.getHdcLicenceData(1)
      expect(result).toEqual(exampleHdcLicenceData)
      expect(licenceApiClient.getHdcLicenceData).toHaveBeenCalledWith(1)
    })
  })
})
