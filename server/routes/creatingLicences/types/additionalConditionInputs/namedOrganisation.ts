import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'
import RemoveEmptyArrayItems from '../../../../transformers/removeEmptyArrayItems'

class NamedOrganisation {
  @Expose()
  @RemoveEmptyArrayItems()
  @ArrayNotEmpty({ message: 'Add at least one group or organisation' })
  nameOfOrganisation: string[]
}

export default NamedOrganisation
