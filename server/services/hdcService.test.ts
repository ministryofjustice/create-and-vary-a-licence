import HdcService from './hdcService'
import LicenceApiClient from '../data/licenceApiClient'
import { CurfewTimes as ApiCurfewTimes, HdcLicenceData } from '../@types/licenceApiClientTypes'
import { AmPm } from '../routes/creatingLicences/types/time'
import { SimpleTime } from '../routes/manageConditions/types'
import { simpleTimeTo24Hour } from '../utils/utils'
import { User } from '../@types/CvlUserDetails'
import { STANDARD_WEEKLY_CURFEW_TIMES } from '../routes/initialAppointment/hdc/curfewDefaults'
import { DAYS } from '../enumeration/days'
import DailyCurfewTime from '../routes/initialAppointment/hdc/types/dailyCurfewTime'

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
    firstNightCurfewTimes: {
      fromTime: '09:00',
      untilTime: '17:00',
    },
    weeklyCurfewTimes: [
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

  const differingCurfewTimes = [
    {
      sequence: 0,
      fromDay: 'MONDAY',
      fromTime: { hour: '08', minute: '00', ampm: 'pm' },
      untilDay: 'TUESDAY',
      untilTime: { hour: '06', minute: '00', ampm: 'am' },
    },
    {
      sequence: 1,
      fromDay: 'TUESDAY',
      fromTime: { hour: '09', minute: '00', ampm: 'pm' },
      untilDay: 'WEDNESDAY',
      untilTime: { hour: '05', minute: '00', ampm: 'am' },
    },
  ] as DailyCurfewTime[]

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateWeeklyCurfewTimes', () => {
    const user = { username: 'joebloggs' } as User
    const licenceId = 123

    it('should call to update the HDC curfew times', async () => {
      await hdcService.updateWeeklyCurfewTimes(licenceId, STANDARD_WEEKLY_CURFEW_TIMES, user)
      const { weeklyCurfewTimes } = exampleHdcLicenceData

      expect(licenceApiClient.updateHdcWeeklyCurfewTimes).toHaveBeenCalledWith(licenceId, { weeklyCurfewTimes }, user)
    })
  })

  describe('updateFirstNightCurfewTimes', () => {
    const user = { username: 'joebloggs' } as User
    const licenceId = 123
    const request = {
      firstNightCurfewTimes: {
        fromTime: '19:00:00',
        untilTime: '07:00:00',
      },
    }

    it('should call to update the HDC first night curfew times', async () => {
      await hdcService.updateFirstNightCurfewTimes(licenceId, request, user)
      expect(licenceApiClient.updateHdcFirstNightCurfewTimes).toHaveBeenCalledWith(licenceId, request, user)
    })
  })

  describe('buildCurfewTimesRequest', () => {
    it('returns one entry per day with same fromDay/untilDay when end > start (same-day span)', () => {
      const start = new SimpleTime('9', '0', AmPm.AM)
      const end = new SimpleTime('5', '0', AmPm.PM)

      const result = hdcService.buildWeeklyCurfewTimesRequest(start, end)
      expect(result.weeklyCurfewTimes).toHaveLength(DAYS.length)

      result.weeklyCurfewTimes.forEach((row, idx) => {
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
      const { weeklyCurfewTimes } = exampleHdcLicenceData

      const result = hdcService.buildWeeklyCurfewTimesRequest(start, end)

      expect(result).toEqual({ weeklyCurfewTimes })
    })

    it('treats equal times as next-day span (end <= start)', () => {
      const start = new SimpleTime('9', '0', AmPm.AM)
      const end = new SimpleTime('9', '0', AmPm.AM)

      const result = hdcService.buildWeeklyCurfewTimesRequest(start, end)
      result.weeklyCurfewTimes.forEach((row, idx) => {
        const nextIdx = (idx + 1) % DAYS.length
        expect(row.untilDay).toBe(DAYS[nextIdx])
      })
    })
  })

  describe('updateDifferingCurfewTimes', () => {
    const user = { username: 'joebloggs' } as User
    const licenceId = 123

    it('should call to update the HDC curfew times with differing times', async () => {
      await hdcService.updateDifferingCurfewTimes(licenceId, differingCurfewTimes, user)

      const expectedRequest = {
        weeklyCurfewTimes: [
          {
            curfewTimesSequence: 0,
            fromDay: 'MONDAY',
            fromTime: '20:00:00',
            untilDay: 'TUESDAY',
            untilTime: '06:00:00',
          },
          {
            curfewTimesSequence: 1,
            fromDay: 'TUESDAY',
            fromTime: '21:00:00',
            untilDay: 'WEDNESDAY',
            untilTime: '05:00:00',
          },
        ],
      }

      expect(licenceApiClient.updateHdcWeeklyCurfewTimes).toHaveBeenCalledWith(licenceId, expectedRequest, user)
    })
  })

  describe('buildDifferingCurfewTimesRequest', () => {
    it('maps DailyCurfewTime array to WeeklyCurfewTimesRequest format', () => {
      const result = hdcService.buildDifferingCurfewTimesRequest(differingCurfewTimes)
      expect(result.weeklyCurfewTimes).toEqual([
        {
          curfewTimesSequence: 0,
          fromDay: 'MONDAY',
          fromTime: '20:00:00',
          untilDay: 'TUESDAY',
          untilTime: '06:00:00',
        },
        {
          curfewTimesSequence: 1,
          fromDay: 'TUESDAY',
          fromTime: '21:00:00',
          untilDay: 'WEDNESDAY',
          untilTime: '05:00:00',
        },
      ])
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
      exampleHdcLicenceData.weeklyCurfewTimes[0].fromTime = '18:00:00'
      licenceApiClient.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      const result = await hdcService.getHdcLicenceData(1)
      expect(result).toEqual({
        ...exampleHdcLicenceData,
        allCurfewTimesEqual: false,
      })
    })
  })

  describe('buildCurfewTimes', () => {
    it('should build form response object from curfew times', () => {
      const curfewTimes = [
        {
          fromTime: '20:00:00',
          fromDay: 'MONDAY',
          untilTime: '06:00:00',
          untilDay: 'TUESDAY',
          curfewTimesSequence: 0,
        },
        {
          fromTime: '22:00:00',
          fromDay: 'TUESDAY',
          untilTime: '08:00:00',
          untilDay: 'WEDNESDAY',
          curfewTimesSequence: 1,
        },
        {
          fromTime: '10:00:00',
          fromDay: 'THURSDAY',
          untilTime: '18:00:00',
          untilDay: 'THURSDAY',
          curfewTimesSequence: 2,
        },
      ] as ApiCurfewTimes[]

      const formResponseObject = hdcService.buildCurfewTimesDisplayObject(curfewTimes)
      expect(formResponseObject).toEqual({
        0: {
          fromTime: { hour: '08', minute: '00', ampm: 'pm' },
          fromDay: 'MONDAY',
          untilTime: { hour: '06', minute: '00', ampm: 'am' },
          untilDay: 'TUESDAY',
          sequence: 0,
        },
        1: {
          fromTime: { hour: '10', minute: '00', ampm: 'pm' },
          fromDay: 'TUESDAY',
          untilTime: { hour: '08', minute: '00', ampm: 'am' },
          untilDay: 'WEDNESDAY',
          sequence: 1,
        },
        2: {
          fromTime: { hour: '10', minute: '00', ampm: 'am' },
          fromDay: 'THURSDAY',
          untilTime: { hour: '06', minute: '00', ampm: 'pm' },
          untilDay: 'THURSDAY',
          sequence: 2,
        },
      })
    })
  })

  describe('buildStandardCurfewHours', () => {
    it('should build form response object from curfew times', () => {
      expect(hdcService.buildStandardCurfewTimesDisplayObject()).toEqual({
        0: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'MONDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'TUESDAY',
          sequence: 0,
        },
        1: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'TUESDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'WEDNESDAY',
          sequence: 1,
        },
        2: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'WEDNESDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'THURSDAY',
          sequence: 2,
        },
        3: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'THURSDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'FRIDAY',
          sequence: 3,
        },
        4: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'FRIDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'SATURDAY',
          sequence: 4,
        },
        5: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'SATURDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'SUNDAY',
          sequence: 5,
        },
        6: {
          fromTime: { hour: '07', minute: '00', ampm: 'pm' },
          fromDay: 'SUNDAY',
          untilTime: { hour: '07', minute: '00', ampm: 'am' },
          untilDay: 'MONDAY',
          sequence: 6,
        },
      })
    })
  })
})
