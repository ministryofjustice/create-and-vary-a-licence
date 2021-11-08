import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'
import RemoveEmptyArrayItems from '../../../../transformers/removeEmptyArrayItems'

class NoContactWithVictim {
  @Expose()
  @RemoveEmptyArrayItems()
  @ArrayNotEmpty({ message: 'Add at least one victim or family member name' })
  name: string[]

  @Expose()
  @RemoveEmptyArrayItems()
  socialServicesDepartment: string[]
}

export default NoContactWithVictim
