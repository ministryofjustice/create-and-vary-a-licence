import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class IntimateRelationshipWithGender {
  @Expose()
  @IsNotEmpty({ message: 'Select a gender' })
  gender: string
}

export default IntimateRelationshipWithGender
