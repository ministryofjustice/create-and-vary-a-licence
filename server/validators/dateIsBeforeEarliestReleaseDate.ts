import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import moment from 'moment'
import _ from 'lodash'
import type SimpleDate from '../routes/creatingLicences/types/date'
// import UkBankHolidayFeedService from '../services/ukBankHolidayFeedService'

export default function DateIsBeforeEarliestReleaseDate(validationOptions?: ValidationOptions) {
  const dateIsBeforeEarliestReleaseDate = async (date: SimpleDate, { object }: ValidationArguments) => {
    const dateAsMoment = date.toMoment()
    const dateToCompare = moment(_.get(object, 'licence.earliestReleaseDate'), 'DD/MM/YYYY')

    return dateAsMoment.isSameOrAfter(dateToCompare)
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'dateIsBeforeEarliestReleaseDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: dateIsBeforeEarliestReleaseDate },
    })
  }
}
