import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class OutOfBoundsPremisesType {
  @Expose()
  @IsNotEmpty({ message: 'Enter area or type of premises' })
  typeOfPremises: string
}

export default OutOfBoundsPremisesType
