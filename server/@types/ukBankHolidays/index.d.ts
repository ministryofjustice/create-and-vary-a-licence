declare module 'uk-bank-holidays' {
  export default class HolidayFeed {
    constructor()

    async load(): void

    divisions(division?: string): Division
  }

  export interface Division {
    holidays(): Holiday[]
  }

  export interface Holiday {
    title: string
    date: string
  }
}
