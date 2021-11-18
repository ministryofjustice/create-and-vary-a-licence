import { Expose } from 'class-transformer'
import { HasAtLeastOne } from '../../../../validators/decorators'

class SpecifiedItem {
  @Expose()
  @HasAtLeastOne({ message: 'Add at least one item' })
  item: string[]
}

export default SpecifiedItem
