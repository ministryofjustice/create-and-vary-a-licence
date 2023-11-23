import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import moment from 'moment'
import _ from 'lodash'
import SimpleDate from '../routes/creatingLicences/types/date'
import type DateString from '../routes/creatingLicences/types/dateString'

export default function DateIsBefore(fieldToCompare: string, validationOptions?: ValidationOptions) {
  const dateIsBefore = (date: SimpleDate | DateString, { object }: ValidationArguments) => {
    const dateAsMoment = date.toMoment()
    const dateToCompare = moment(_.get(object, fieldToCompare), 'DD/MM/YYYY')

    if (!dateToCompare.isValid()) {
      throw new Error(
        `Date to compare is not in a valid date format: ${fieldToCompare} - ${_.get(object, fieldToCompare)}`
      )
    }

    return dateAsMoment.isSameOrBefore(dateToCompare)
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'dateIsBefore',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: dateIsBefore },
    })
  }
}
