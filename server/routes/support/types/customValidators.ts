import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { startOfDay, endOfDay } from 'date-fns'
import { toDate } from '../../../utils/date'

interface DateAsString extends ValidationArguments {
  object: { startDate: string; endDate: string }
}

export default class CustomValidators {
  IsDateFormat = (property: string, validationOptions?: ValidationOptions) => {
    return (object: unknown, propertyName: string) => {
      registerDecorator({
        name: 'isDateFormat',
        target: object.constructor,
        propertyName,
        constraints: [property],
        options: validationOptions,
        validator: {
          validate(endDate: string) {
            const regex = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/
            return regex.test(endDate)
          },
        },
      })
    }
  }

  IsAfterStartDate = (property: string, validationOptions?: ValidationOptions) => {
    return (object: unknown, propertyName: string) => {
      registerDecorator({
        name: 'isAfterStartDate',
        target: object.constructor,
        propertyName,
        constraints: [property],
        options: validationOptions,
        validator: {
          validate(_obj, DateRangeObj: DateAsString) {
            return isStartBeforeEnd(DateRangeObj.object.startDate, DateRangeObj.object.endDate)
          },
        },
      })
    }
  }
}

function isStartBeforeEnd(startDate: string, endDate: string) {
  return startOfDay(toDate(startDate)) < endOfDay(toDate(endDate))
}
