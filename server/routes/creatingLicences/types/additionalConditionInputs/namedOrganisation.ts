import { Expose } from 'class-transformer'
import { HasAtLeastOne } from '../../../../validators/decorators'

class NamedOrganisation {
  @Expose()
  @HasAtLeastOne({ message: 'Add at least one group or organisation' })
  nameOfOrganisation: string[]
}

export default NamedOrganisation
