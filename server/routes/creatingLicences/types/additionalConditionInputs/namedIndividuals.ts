import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'
import RemoveEmptyArrayItems from '../../../../transformers/removeEmptyArrayItems'

class NamedIndividuals {
  @Expose()
  @RemoveEmptyArrayItems()
  @ArrayNotEmpty({ message: 'Add at least one offender or individual' })
  nameOfIndividual: string[]
}

export default NamedIndividuals
