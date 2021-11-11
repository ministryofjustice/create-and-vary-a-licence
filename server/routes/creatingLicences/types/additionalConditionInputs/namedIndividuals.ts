import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'

class NamedIndividuals {
  @Expose()
  @ArrayNotEmpty({ message: 'Add at least one offender or individual' })
  nameOfIndividual: string[]
}

export default NamedIndividuals
