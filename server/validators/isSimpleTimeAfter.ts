import { ValidationArguments } from 'class-validator'
import SimpleTime from '../routes/creatingLicences/types/time'

export default function isSimpleTimeAfter(value: SimpleTime, args: ValidationArguments) {
  const [relatedPropertyName] = args.constraints
  const relatedValue = args.object[relatedPropertyName]

  if (!(relatedValue instanceof SimpleTime)) {
    throw new Error('The field supplied for comparison was not of the required type i.e. SimpleTime')
  }

  return value.toMoment().isAfter(relatedValue.toMoment())
}
