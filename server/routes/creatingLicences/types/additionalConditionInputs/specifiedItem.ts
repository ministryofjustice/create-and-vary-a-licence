import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'
import RemoveEmptyArrayItems from '../../../../transformers/removeEmptyArrayItems'

class SpecifiedItem {
  @Expose()
  @RemoveEmptyArrayItems()
  @ArrayNotEmpty({ message: 'Add at least one item' })
  item: string[]
}

export default SpecifiedItem
