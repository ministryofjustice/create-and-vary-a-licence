import { registerDecorator, ValidationOptions } from 'class-validator'
import moment from 'moment'
import SimpleDate from '../routes/creatingLicences/types/date'
import type { DateString } from '../routes/creatingLicences/types/dateString'
import UkBankHolidayFeedService from '../services/ukBankHolidayFeedService'

export default function DateIsOnWorkDay(validationOptions?: ValidationOptions) {
  const dateIsOnWorkDay = async (date: SimpleDate | DateString) => {
    const bankHolidays = await new UkBankHolidayFeedService().getEnglishAndWelshHolidays()

    const dateAsMoment = typeof date === 'string' ? moment(date, 'DD/MM/YYYY') : date.toMoment()

    return !bankHolidays.isBankHolidayOrWeekend(dateAsMoment, false)
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'dateIsOnWorkDay',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: dateIsOnWorkDay },
    })
  }
}
