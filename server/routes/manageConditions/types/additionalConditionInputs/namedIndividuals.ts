import { Expose } from 'class-transformer'
import HasAtLeastOne from '../../../../validators/hasAtLeastOne'

class NamedIndividuals {
  @Expose()
  @HasAtLeastOne({ message: 'Add at least one offender or individual' })
  nameOfIndividual: string[]
}

export default NamedIndividuals
