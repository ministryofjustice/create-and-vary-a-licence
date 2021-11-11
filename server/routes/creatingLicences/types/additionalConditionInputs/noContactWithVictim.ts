import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'

class NoContactWithVictim {
  @Expose()
  @ArrayNotEmpty({ message: 'Add at least one victim or family member name' })
  name: string[]

  @Expose()
  socialServicesDepartment: string
}

export default NoContactWithVictim
