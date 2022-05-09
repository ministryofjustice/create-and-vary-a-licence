declare module 'uk-bank-holidays' {
  import { Holiday } from '../ukBankHolidayFeedTypes'

  export default class HolidayFeed {
    constructor()

    async load(): void

    divisions(division?: string): Division
  }

  export interface Division {
    holidays(): Holiday[]
  }
}
