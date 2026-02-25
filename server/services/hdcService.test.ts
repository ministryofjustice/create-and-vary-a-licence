import HdcService from './hdcService'
import LicenceApiClient from '../data/licenceApiClient'
import { HdcLicenceData } from '../@types/licenceApiClientTypes'
import { AmPm } from '../routes/creatingLicences/types/time'
import { SimpleTime } from '../routes/manageConditions/types'
import { DAYS, simpleTimeTo24Hour } from '../utils/utils'
import { User } from '../@types/CvlUserDetails'
import STANDARD_CURFEW_TIMES from '../routes/initialAppointment/hdc/curfewDefaults'

jest.mock('../data/licenceApiClient')

describe('HDC Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const hdcService = new HdcService(licenceApiClient)

  const exampleHdcLicenceData = {
    curfewAddress: {
      addressLine1: 'addressLineOne',
      addressLine2: 'addressLineTwo',
      townOrCity: 'addressTownOrCity',
      county: 'county',
      postcode: 'addressPostcode',
    },
    firstNightCurfewHours: {
      firstNightFrom: '09:00',
      firstNightUntil: '17:00',
    },
    curfewTimes: [
      {
        curfewTimesSequence: 0,
        fromDay: 'MONDAY',
        fromTime: '19:00:00',
        untilDay: 'TUESDAY',
        untilTime: '07:00:00',
      },
      {
        curfewTimesSequence: 1,
        fromDay: 'TUESDAY',
        fromTime: '19:00:00',
        untilDay: 'WEDNESDAY',
        untilTime: '07:00:00',
      },
      {
        curfewTimesSequence: 2,
        fromDay: 'WEDNESDAY',
        fromTime: '19:00:00',
        untilDay: 'THURSDAY',
        untilTime: '07:00:00',
      },
      {
        curfewTimesSequence: 3,
        fromDay: 'THURSDAY',
        fromTime: '19:00:00',
        untilDay: 'FRIDAY',
        untilTime: '07:00:00',
      },
      {
        curfewTimesSequence: 4,
        fromDay: 'FRIDAY',
        fromTime: '19:00:00',
        untilDay: 'SATURDAY',
        untilTime: '07:00:00',
      },
      {
        curfewTimesSequence: 5,
        fromDay: 'SATURDAY',
        fromTime: '19:00:00',
        untilDay: 'SUNDAY',
        untilTime: '07:00:00',
      },
      {
        curfewTimesSequence: 6,
        fromDay: 'SUNDAY',
        fromTime: '19:00:00',
        untilDay: 'MONDAY',
        untilTime: '07:00:00',
      },
    ],
  } as HdcLicenceData

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateCurfewTimes', () => {
    const user = { username: 'joebloggs' } as User
    const licenceId = 123

    it('should call to update the HDC curfew times', async () => {
      await hdcService.updateCurfewTimes(licenceId, STANDARD_CURFEW_TIMES, user)
      const { curfewTimes } = exampleHdcLicenceData

      expect(licenceApiClient.updateCurfewTimes).toHaveBeenCalledWith(licenceId, { curfewTimes }, user)
    })
  })

  describe('buildCurfewTimesRequest', () => {
    it('returns one entry per day with same fromDay/untilDay when end > start (same-day span)', () => {
      const start = new SimpleTime('9', '0', AmPm.AM)
      const end = new SimpleTime('5', '0', AmPm.PM)

      const result = hdcService.buildCurfewTimesRequest(start, end)
      expect(result.curfewTimes).toHaveLength(DAYS.length)

      result.curfewTimes.forEach((row, idx) => {
        expect(row.curfewTimesSequence).toBe(idx)
        expect(row.fromDay).toBe(DAYS[idx])
        expect(row.untilDay).toBe(DAYS[idx])
        expect(row.fromTime).toBe(simpleTimeTo24Hour(start))
        expect(row.untilTime).toBe(simpleTimeTo24Hour(end))
      })
    })

    it('builds correct HDC-style next-day curfew schedule', () => {
      const start = new SimpleTime('07', '00', AmPm.PM)
      const end = new SimpleTime('07', '00', AmPm.AM)
      const { curfewTimes } = exampleHdcLicenceData

      const result = hdcService.buildCurfewTimesRequest(start, end)

      expect(result).toEqual({ curfewTimes })
    })

    it('treats equal times as next-day span (end <= start)', () => {
      const start = new SimpleTime('9', '0', AmPm.AM)
      const end = new SimpleTime('9', '0', AmPm.AM)

      const result = hdcService.buildCurfewTimesRequest(start, end)
      result.curfewTimes.forEach((row, idx) => {
        const nextIdx = (idx + 1) % DAYS.length
        expect(row.untilDay).toBe(DAYS[nextIdx])
      })
    })
  })

  describe('Get HDC information', () => {
    it('Should retrieve HDC information', async () => {
      licenceApiClient.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await hdcService.getHdcLicenceData(1)
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
      exampleHdcLicenceData.curfewTimes[0].fromTime = '18:00:00'
      licenceApiClient.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      const result = await hdcService.getHdcLicenceData(1)
      expect(result).toEqual({
        ...exampleHdcLicenceData,
        allCurfewTimesEqual: false,
      })
    })
  })
})
