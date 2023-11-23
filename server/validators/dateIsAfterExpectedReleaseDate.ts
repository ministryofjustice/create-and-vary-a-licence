import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import moment, { Moment } from 'moment'
import _ from 'lodash'
import type SimpleDate from '../routes/creatingLicences/types/date'
import type DateString from '../routes/creatingLicences/types/dateString'
import UkBankHolidayFeedService from '../services/ukBankHolidayFeedService'

export default function DateIsAfterExpectedReleaseDate(validationOptions?: ValidationOptions) {
  const bankHolidayService = new UkBankHolidayFeedService()

  const dateIsAfterExpectedReleaseDate = async (date: SimpleDate | DateString, { object }: ValidationArguments) => {
    const bankHolidays = await bankHolidayService.getEnglishAndWelshHolidays()

    const getWorkingDayOnOrBefore = (d: Moment): Moment => {
      return bankHolidays.isBankHolidayOrWeekend(d) ? getWorkingDayOnOrBefore(d.subtract(1, 'day')) : d
    }

    const dateAsMoment = date.toMoment()

    const dateToCompare = moment(
      _.get(object, 'licence.actualReleaseDate') || _.get(object, 'licence.conditionalReleaseDate'),
      'DD/MM/YYYY'
    )
    if (!dateToCompare.isValid()) {
      throw new Error(
        `Date to compare is not in a valid date format: ActualReleaseDate - ${_.get(
          object,
          'licence.actualReleaseDate'
        )}, conditionalReleaseDate - ${_.get(object, 'licence.conditionalReleaseDate')}`
      )
    }

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
