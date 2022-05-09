import { registerDecorator, ValidationOptions } from 'class-validator'
import SimpleDate from '../routes/creatingLicences/types/date'
import UkBankHolidayFeedService from '../services/ukBankHolidayFeedService'
import { isBankHolidayOrWeekend } from '../utils/utils'

export default function DateIsOnWorkDay(validationOptions?: ValidationOptions) {
  const dateIsOnWorkDay = async (date: SimpleDate) => {
    const bankHolidays = await new UkBankHolidayFeedService().getEnglishAndWelshHolidays()

    const dateAsMoment = date.toMoment()

    return !isBankHolidayOrWeekend(dateAsMoment, bankHolidays)
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
