import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator'

class RestrictionOfResidencyPolicyV3 {
  @Expose()
  @IsNotEmpty({ message: 'Select the relevant gender' })
  gender: string

  @Expose()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Enter the relevant age' })
  @IsNumber({}, { message: 'Enter a number' })
  @Min(1, { message: 'Age must not be less than 1' })
  @Max(18, { message: 'Age must not be more than 18' })
  age: string
}

export default RestrictionOfResidencyPolicyV3
