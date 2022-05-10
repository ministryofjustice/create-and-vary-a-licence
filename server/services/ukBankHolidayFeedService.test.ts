import HolidayFeed from 'uk-bank-holidays'
import UkBankHolidayFeedService from './ukBankHolidayFeedService'

jest.mock('uk-bank-holidays')

describe('Uk bank holiday feed service', () => {
  const ukBankHolidayFeedService = new UkBankHolidayFeedService() as jest.Mocked<UkBankHolidayFeedService>

  const divisions = jest.spyOn(HolidayFeed.prototype, 'divisions')
  divisions.mockImplementation(() => {
    return {
      holidays: () => {
        return [
          {
            title: "Queen's Platinum Jubilee",
            date: '2022-06-03',
          },
        ]
      },
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getEnglishAndWelshHolidays', () => {
    it('Should return the list of english and welsh holidays', async () => {
      const result = await ukBankHolidayFeedService.getEnglishAndWelshHolidays()
      expect(result).toEqual([
        {
          title: "Queen's Platinum Jubilee",
          date: '2022-06-03',
        },
      ])
    })
  })
})
