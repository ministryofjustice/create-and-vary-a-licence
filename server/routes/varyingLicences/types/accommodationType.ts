import { Expose } from 'class-transformer'
import { IsIn, IsNotEmpty } from 'class-validator'
import CurfewAccommodationType from '../../../enumeration/curfewAccommodationType'

const message = 'Select an accommodation type'

class AccommodationTypeQuestion {
  @Expose()
  @IsNotEmpty({ message })
  @IsIn(Object.values(CurfewAccommodationType), { message })
  accommodationType: CurfewAccommodationType
}

export default AccommodationTypeQuestion
