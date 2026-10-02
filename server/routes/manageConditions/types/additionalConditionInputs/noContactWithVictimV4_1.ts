import { Expose } from 'class-transformer'
import HasAtLeastOne from '../../../../validators/hasAtLeastOne'

// eslint-disable-next-line camelcase
class NoContactWithVictimV4_1 {
  @Expose()
  @HasAtLeastOne({ message: 'Add at least one victim or family member name' })
  name: string[]
}

// eslint-disable-next-line camelcase
export default NoContactWithVictimV4_1
