import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import moment from 'moment'
import _ from 'lodash'
import type SimpleDate from '../routes/creatingLicences/types/date'
import DateString from '../routes/creatingLicences/types/dateString'

export default function DateIsAfterExpectedReleaseDate(validationOptions?: ValidationOptions) {
  const DateIsAfterExpectedReleaseDate = async (date: SimpleDate | DateString, { object }: ValidationArguments) => {
    return true
    // const dateAsMoment = date.toMoment()
    // const dateToCompare = moment(_.get(object, 'licence.earliestReleaseDate'), 'DD/MM/YYYY')
    // if (!dateToCompare.isValid()) {
    //   throw new Error(
    //     `Date to compare is not in a valid date format: EarliestReleaseDate - ${_.get(
    //       object,
    //       'licence.earliestReleaseDate'
    //     )}`
    //   )
    // }

    // return dateAsMoment.isSameOrAfter(dateToCompare)
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'DateIsAfterExpectedReleaseDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: DateIsAfterExpectedReleaseDate,
        defaultMessage({ object }: ValidationArguments) {
          const isEligibleForEarlyRelease = _.get(object, 'licence.isEligibleForEarlyRelease') || false

          if (isEligibleForEarlyRelease) {
            return 'Date cannot be more than 3 working days before release. Choose to skip this step if the release date has not been confirmed'
          }
          return 'Date must be on or after release. Choose to skip this step if the release date has not been confirmed'
        },
      },
    })
  }
}
