import { Expose } from 'class-transformer'
import { HasAtLeastOne } from '../../../../validators/decorators'

class NamedIndividuals {
  @Expose()
  @HasAtLeastOne({ message: 'Add at least one offender or individual' })
  nameOfIndividual: string[]
}

export default NamedIndividuals
