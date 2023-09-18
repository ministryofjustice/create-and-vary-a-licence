import moment, { type Moment } from 'moment'
import HolidayFeed, { type Holiday } from 'uk-bank-holidays'

const A_DAY_IN_MS = 24 * 60 * 60 * 1000

export type BankHolidayRetriever = () => Promise<Holiday[]>

const bankHolidayRetriever = () => {
  const feed = new HolidayFeed()
  return async (): Promise<Holiday[]> => {
    await feed.load()
    return feed.divisions('england-and-wales').holidays()
  }
}

class BankHolidays {
  constructor(readonly bankHolidays: Holiday[]) {}

  isBankHolidayOrWeekend = (date: Moment) => {
    return (
      date.isoWeekday() === 6 ||
      date.isoWeekday() === 7 ||
      this.bankHolidays.find(hol => moment(hol.date).isSame(date, 'day')) !== undefined
    )
  }
}

export default class UkBankHolidayFeedService {
  private lastUpdated = 0

  private holidays: Holiday[] = []

  constructor(private readonly getBankHolidays: BankHolidayRetriever = bankHolidayRetriever()) {}

  async getEnglishAndWelshHolidays(): Promise<BankHolidays> {
    await this.refreshFeed()
    return new BankHolidays(this.holidays)
  }

  private async refreshFeed() {
    // Refresh the feed every 24 hours
    if (this.holidays.length === 0 || this.lastUpdated <= Date.now() - A_DAY_IN_MS) {
      this.holidays = await this.getBankHolidays()
      this.lastUpdated = Date.now()
    }
  }
}
