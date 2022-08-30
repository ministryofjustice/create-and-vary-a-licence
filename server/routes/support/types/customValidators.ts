import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

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
            const regex = /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/
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
  const parsedStartDate = startDate.split('/')
  const parsedEndDate = endDate.split('/')
  const StartDateDate = parseInt(parsedStartDate[0], 10)
  const StartDateMonth = parseInt(parsedStartDate[1], 10)
  const StartDateYear = parseInt(parsedStartDate[2], 10)

  const EndDateDate = parseInt(parsedEndDate[0], 10)
  const EndDateMonth = parseInt(parsedEndDate[1], 10)
  const EndDateYear = parseInt(parsedEndDate[2], 10)

  const dateStart = new Date(StartDateYear, StartDateMonth - 1, StartDateDate, 0, 0, 0, 0)
  const dateEnd = new Date(EndDateYear, EndDateMonth - 1, EndDateDate + 1, 0, 0, 0, 0)
  return dateStart < dateEnd
}
