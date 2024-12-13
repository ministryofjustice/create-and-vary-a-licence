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
        fromTime: '17:00:00',
        untilDay: 'TUESDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 2,
        fromDay: 'TUESDAY',
        fromTime: '17:00:00',
        untilDay: 'WEDNESDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 3,
        fromDay: 'WEDNESDAY',
        fromTime: '17:00:00',
        untilDay: 'THURSDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 4,
        fromDay: 'THURSDAY',
        fromTime: '17:00:00',
        untilDay: 'FRIDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 5,
        fromDay: 'FRIDAY',
        fromTime: '17:00:00',
        untilDay: 'SATURDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 6,
        fromDay: 'SATURDAY',
        fromTime: '17:00:00',
        untilDay: 'SUNDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 7,
        fromDay: 'MONDAY',
        fromTime: '17:00:00',
        untilDay: 'SUNDAY',
        untilTime: '09:00:00',
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

    it('Should set allCurfewTimesEqual to true when all curfew times are the same', async () => {
      licenceApiClient.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      const result = await hdcService.getHdcLicenceData(1)
      expect(result).toEqual({
        ...exampleHdcLicenceData,
        allCurfewTimesEqual: true,
      })
    })

    it('Should set allCurfewTimesEqual to false when curfew times are different', async () => {
      const differentCurfewTimes = exampleHdcLicenceData
      differentCurfewTimes.curfewTimes[0].fromTime = '18:00:00'

      licenceApiClient.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      const result = await hdcService.getHdcLicenceData(1)
      expect(result).toEqual({
        ...exampleHdcLicenceData,
        allCurfewTimesEqual: false,
      })
    })
  })
})
