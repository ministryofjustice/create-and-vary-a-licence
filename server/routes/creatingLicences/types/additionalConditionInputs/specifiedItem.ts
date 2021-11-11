import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'

class SpecifiedItem {
  @Expose()
  @ArrayNotEmpty({ message: 'Add at least one item' })
  item: string[]
}

export default SpecifiedItem
