import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import CustomValidators from './customValidators'

const { isDateFormat } = new CustomValidators()

class DateRange {
  @Expose()
  @IsNotEmpty({ message: 'Enter start date' })
  @isDateFormat('startDate', { message: 'Invalid date format. Use d/m/yyyy' })
  startDate: string

  @Expose()
  @IsNotEmpty({ message: 'Enter end date' })
  @isDateFormat('endDate', { message: 'Invalid date format. Use d/m/yyyy' })
  endDate: string
}

export default DateRange
