import moment from 'moment'
import UkBankHolidayFeedService from './ukBankHolidayFeedService'

describe('Uk bank holiday feed service', () => {
  const ukBankHolidayFeedService = new UkBankHolidayFeedService(async () => [
    {
      date: '2022-06-03',
    },
  ])

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getEnglishAndWelshHolidays', () => {
    it('Should return the list of english and welsh holidays', async () => {
      const result = await ukBankHolidayFeedService.getEnglishAndWelshHolidays()
      expect(result.bankHolidays).toEqual([
        {
          date: '2022-06-03',
        },
      ])
    })

    it('Should say when bank holidays are', async () => {
      const result = await ukBankHolidayFeedService.getEnglishAndWelshHolidays()
      expect(result.isBankHolidayOrWeekend(moment('2022-06-03'))).toBeTruthy()
      expect(result.isBankHolidayOrWeekend(moment('2022-06-01'))).toBeFalsy()
    })

    it('Should say when weekends are', async () => {
      const result = await ukBankHolidayFeedService.getEnglishAndWelshHolidays()
      expect(result.isBankHolidayOrWeekend(moment('2023-09-15'))).toBeFalsy()
      expect(result.isBankHolidayOrWeekend(moment('2023-09-16'))).toBeTruthy()
      expect(result.isBankHolidayOrWeekend(moment('2023-09-17'))).toBeTruthy()
      expect(result.isBankHolidayOrWeekend(moment('2023-09-18'))).toBeFalsy()
    })
  })
})
