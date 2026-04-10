import { ValidationArguments, ValidatorConstraint } from 'class-validator'
import ValidCurfewTime from './curfewTimeValidator'
import { convertToTitleCase, lowercaseFirstLetter } from '../utils/utils'
import DailyCurfewTime from '../routes/initialAppointment/hdc/types/dailyCurfewTime'
import { SimpleTime } from '../routes/manageConditions/types'

@ValidatorConstraint()
export default class ValidDailyCurfewTime extends ValidCurfewTime {
  defaultMessage(args: ValidationArguments): string {
    const simpleTime = args.value as SimpleTime
    const fieldName = args.property

    const error = this.getError(simpleTime, fieldName)
    const curfewDay = convertToTitleCase((args.object as DailyCurfewTime).startDay)
    return `For the curfew starting ${curfewDay}, ${lowercaseFirstLetter(error)}`
  }
}
