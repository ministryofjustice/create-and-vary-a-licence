import { registerDecorator, ValidationOptions } from 'class-validator'
import SimpleDate from '../routes/creatingLicences/types/date'
import UkBankHolidayFeedService from '../services/ukBankHolidayFeedService'

export default function DateIsOnWorkDay(validationOptions?: ValidationOptions) {
  const dateIsOnWorkDay = async (date: SimpleDate) => {
    const bankHolidays = await new UkBankHolidayFeedService().getEnglishAndWelshHolidays()

    const dateAsMoment = date.toMoment()

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
