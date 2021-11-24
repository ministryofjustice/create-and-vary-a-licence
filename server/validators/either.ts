import { ValidateIf } from 'class-validator'
import { objectIsEmpty } from '../utils/utils'

export default function Either(fieldName: string) {
  return ValidateIf((object, value) => {
    return !objectIsEmpty(value) || objectIsEmpty(object[fieldName])
  })
}
