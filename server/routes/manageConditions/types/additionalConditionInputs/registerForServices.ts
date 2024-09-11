import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class RegisterForServices {
  @Expose()
  @IsNotEmpty({ message: 'Select the relevant services' })
  services: string[]
}

export default RegisterForServices
