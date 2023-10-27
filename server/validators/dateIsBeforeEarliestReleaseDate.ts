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
          const actualReleaseDate = moment(_.get(object, 'licence.actualReleaseDate'), 'DD/MM/YYYY')
          const conditionalReleaseDate = moment(_.get(object, 'licence.conditionalReleaseDate'), 'DD/MM/YYYY')
          const earliestReleaseDate = moment(_.get(object, 'licence.earliestReleaseDate'), 'DD/MM/YYYY')
          const isEligibleForEarlyRelease = !moment(actualReleaseDate || conditionalReleaseDate).isSame(
            earliestReleaseDate
          )

          if (isEligibleForEarlyRelease) {
            return 'Date cannot be more than 3 working days before release date'
          }
          return 'Date must be on or after the release date'
        },
      },
    })
  }
}
