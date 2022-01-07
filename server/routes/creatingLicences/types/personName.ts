import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class PersonName {
  @Expose()
  @IsNotEmpty({ message: 'Enter a name or job title' })
  contactName: string
}

export default PersonName
