import moment, { type Moment } from 'moment'
import { addDays, subDays } from 'date-fns'
import { LicenceApiClient } from '../data'
import { InMemoryTokenStore } from '../data/tokenStore'
import { getSystemTokenWithRetries } from '../data/systemToken'

const AN_HOUR_IN_MS = 1 * 60 * 60 * 1000

export type BankHolidayRetriever = () => Promise<string[]>

const bankHolidayRetriever = () => {
  return async (): Promise<string[]> => {
    const licenceApiClient = new LicenceApiClient(new InMemoryTokenStore(getSystemTokenWithRetries))
    return licenceApiClient.getBankHolidaysForEnglandAndWales()
  }
}

export class BankHolidays {
  constructor(readonly bankHolidays: string[]) {}

  isBankHolidayOrWeekend = (date: Moment, addFriday: boolean = true) => {
    return (
      (addFriday && date.isoWeekday() === 5) ||
      date.isoWeekday() === 6 ||
      date.isoWeekday() === 7 ||
      this.bankHolidays.find(hol => moment(hol).isSame(date, 'day')) !== undefined
    )
  }

  getTwoWorkingDaysAfterDate = (date: Date): Date => {
    const workingDays: Date[] = []
    let dayAfter = date
    while (workingDays.length < 2) {
      dayAfter = addDays(dayAfter, 1)
      if (!this.isBankHolidayOrWeekend(moment(dayAfter), false)) {
        workingDays.push(dayAfter)
      }
    }
    return workingDays[1]
  }

  getXWorkingDaysBeforeDate = (date: Date, numberOfDays: number): Date => {
    const workingDays: Date[] = []
    let dayBefore = date
    while (workingDays.length < numberOfDays) {
      dayBefore = subDays(dayBefore, 1)
      if (!this.isBankHolidayOrWeekend(moment(dayBefore), false)) {
        workingDays.push(dayBefore)
      }
    }
    return workingDays[workingDays.length - 1]
  }
}

export default class UkBankHolidayFeedService {
  private lastUpdated = 0

  private holidays: string[] = []

  constructor(private readonly getBankHolidays: BankHolidayRetriever = bankHolidayRetriever()) {}

  async getEnglishAndWelshHolidays(): Promise<BankHolidays> {
    await this.refreshFeed()
    return new BankHolidays(this.holidays)
  }

  private async refreshFeed() {
    // Refresh the feed every hour
    if (this.holidays.length === 0 || this.lastUpdated <= Date.now() - AN_HOUR_IN_MS) {
      this.holidays = await this.getBankHolidays()
      this.lastUpdated = Date.now()
    }
  }
}
