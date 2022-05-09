import HolidayFeed from 'uk-bank-holidays'
import logger from '../../logger'
import { Holiday } from '../@types/ukBankHolidayFeedTypes'

const A_DAY_IN_MS = 24 * 60 * 60 * 1000

export default class UkBankHolidayFeedService {
  private feed = new HolidayFeed()

  private lastUpdated = 0

  async getEnglishAndWelshHolidays(): Promise<Holiday[]> {
    await this.refreshFeed()
    return this.feed.divisions('england-and-wales').holidays()
  }

  private async refreshFeed() {
    // Refresh the feed every 24 hours
    if (this.lastUpdated <= Date.now() - A_DAY_IN_MS) {
      logger.info(`Fetching UK bank holidays from GOV Feed`)
      await this.feed.load()
      this.lastUpdated = Date.now()
    }
  }
}
