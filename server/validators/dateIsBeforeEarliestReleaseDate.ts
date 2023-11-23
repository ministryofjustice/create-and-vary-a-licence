import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import moment from 'moment'
import _ from 'lodash'
import type SimpleDate from '../routes/creatingLicences/types/date'

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
      validator: {
        validate: dateIsBeforeEarliestReleaseDate,
        defaultMessage({ object }: ValidationArguments) {
          const isEligibleForEarlyRelease = _.get(object, 'licence.isEligibleForEarlyRelease') || false

          if (isEligibleForEarlyRelease) {
            return 'Date cannot be more than 3 working days before release date'
          }
          return 'Date must be on or after the release date'
        },
      },
    })
  }
}
