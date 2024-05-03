import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import moment from 'moment'
import _ from 'lodash'
import SimpleDate from '../routes/creatingLicences/types/date'
import type DateString from '../routes/creatingLicences/types/dateString'
import LicenceType from '../enumeration/licenceType'

export default function DateIsBeforeLicenceExpiryOrTused(validationOptions?: ValidationOptions) {
  const dateIsBeforeLicenceExpiryOrTused = (date: SimpleDate | DateString, { object }: ValidationArguments) => {
    const dateAsMoment = date.toMoment()
    const licenceType = _.get(object, 'licence.typeCode')
    let dateToCompare
    let fieldToCompare
    if (licenceType === LicenceType.AP || licenceType === LicenceType.AP_PSS) {
      fieldToCompare = 'licence.licenceExpiryDate'
      dateToCompare = moment(_.get(object, fieldToCompare), 'DD/MM/YYYY')
    } else if (licenceType === LicenceType.PSS) {
      fieldToCompare = 'licence.topupSupervisionExpiryDate'
      dateToCompare = moment(_.get(object, fieldToCompare), 'DD/MM/YYYY')
    }

    if (!fieldToCompare) {
      throw new Error(`Unable to find LED or TUSED for dateIsBeforeLicenceExpiryOrTused comparison`)
    } else if (!dateToCompare.isValid()) {
      throw new Error(
        `Date to compare is not in a valid date format: ${fieldToCompare} - ${_.get(object, fieldToCompare)}`
      )
    }

    return dateAsMoment.isSameOrBefore(dateToCompare)
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'dateIsBeforeLicenceExpiryOrTused',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: dateIsBeforeLicenceExpiryOrTused },
    })
  }
}
