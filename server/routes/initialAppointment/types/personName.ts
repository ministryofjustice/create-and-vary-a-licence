import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, MaxLength, ValidateIf } from 'class-validator'

class PersonName {
  @Expose()
  @ValidateIf(o => o.appointmentPersonType === 'SPECIFIC_PERSON')
  @IsNotEmpty({ message: 'Enter a name or job title' })
  @MaxLength(100, { message: 'Name or job title must be 100 characters or less' })
  contactName: string

  @Expose()
  @Type(() => String)
  appointmentPersonType: 'DUTY_OFFICER' | 'RESPONSIBLE_COM' | 'SPECIFIC_PERSON'
}

export default PersonName
