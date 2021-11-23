import { Expose } from 'class-transformer'
import HasAtLeastOne from '../../../../validators/hasAtLeastOne'

class NoContactWithVictim {
  @Expose()
  @HasAtLeastOne({ message: 'Add at least one victim or family member name' })
  name: string[]

  @Expose()
  socialServicesDepartment: string
}

export default NoContactWithVictim
