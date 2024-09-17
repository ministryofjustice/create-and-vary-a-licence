import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class DigitalServices {
  @Expose()
  @IsNotEmpty({ message: 'Select all that apply' })
  services: string[]
}

export default DigitalServices
