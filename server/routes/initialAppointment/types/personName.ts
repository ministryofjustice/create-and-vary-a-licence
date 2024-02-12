import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'

class PersonName {
  @Expose()
  @ValidateIf(o => o.appointmentWithType === 'SOMEONE_ELSE')
  @IsNotEmpty({ message: 'Enter a name or job title' })
  contactName: string

  @Expose()
  @Type(() => String)
  appointmentWithType: 'DUTY_OFFICER' | 'RESPONSIBLE_COM' | 'SOMEONE_ELSE'
}

export default PersonName
