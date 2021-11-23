import { ValidateIf } from 'class-validator'
import { objectIsEmpty } from '../utils/utils'

export default function IsOptional() {
  return ValidateIf((object, value) => {
    return !objectIsEmpty(value)
  })
}
