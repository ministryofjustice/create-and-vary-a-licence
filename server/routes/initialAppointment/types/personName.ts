import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'
import config from '../../../config'

class PersonName {
  @Expose()
  @ValidateIf(o => !config.hardStopEnabled || o.appointmentPersonType === 'SPECIFIC_PERSON')
  @IsNotEmpty({ message: 'Enter a name or job title' })
  contactName: string

  @Expose()
  @Type(() => String)
  appointmentPersonType: 'DUTY_OFFICER' | 'RESPONSIBLE_COM' | 'SPECIFIC_PERSON'
}

export default PersonName
