import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import CustomValidators from './customValidators'

const { IsDateFormat, IsAfterStartDate } = new CustomValidators()

export default class DateRange {
  @Expose()
  @IsNotEmpty({ message: 'Enter start date' })
  @IsDateFormat('startDate', { message: 'Invalid date format. Use d/m/yyyy' })
  startDate: string

  @Expose()
  @IsNotEmpty({ message: 'Enter end date' })
  @IsDateFormat('endDate', { message: 'Invalid date format. Use d/m/yyyy' })
  @IsAfterStartDate('startDate', { message: 'End date must be on or after start date' })
  endDate: string
}
