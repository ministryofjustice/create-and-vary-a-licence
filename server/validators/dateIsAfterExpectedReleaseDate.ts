import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import moment, { Moment } from 'moment'
import _ from 'lodash'
import SimpleDate from '../routes/creatingLicences/types/date'
import UkBankHolidayFeedService from '../services/ukBankHolidayFeedService'
import { isBankHolidayOrWeekend } from '../utils/utils'

export default function DateIsAfterExpectedReleaseDate(validationOptions?: ValidationOptions) {
  const dateIsAfterExpectedReleaseDate = async (date: SimpleDate, { object }: ValidationArguments) => {
    const bankHolidays = await new UkBankHolidayFeedService().getEnglishAndWelshHolidays()

    const getWorkingDayOnOrBefore = (d: Moment): Moment => {
      return isBankHolidayOrWeekend(d, bankHolidays) ? getWorkingDayOnOrBefore(d.subtract(1, 'day')) : d
    }

    const dateAsMoment = date.toMoment()

    const dateToCompare = moment(
      _.get(object, 'licence.actualReleaseDate') || _.get(object, 'licence.conditionalReleaseDate'),
      'DD/MM/YYYY'
    )

    return dateAsMoment.isSameOrAfter(getWorkingDayOnOrBefore(dateToCompare))
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'dateIsAfterExpectedReleaseDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: dateIsAfterExpectedReleaseDate },
    })
  }
}
