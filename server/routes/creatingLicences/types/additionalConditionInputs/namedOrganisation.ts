import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'

class NamedOrganisation {
  @Expose()
  @ArrayNotEmpty({ message: 'Add at least one group or organisation' })
  nameOfOrganisation: string[]
}

export default NamedOrganisation
