import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator'

// eslint-disable-next-line camelcase
class UnsupervisedContactPolicyV4_1 {
  @Expose()
  @IsNotEmpty({ message: 'Enter a gender' })
  gender: string

  @Expose()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Enter the relevant age' })
  @IsNumber({}, { message: 'Enter a number' })
  @Min(1, { message: 'Age must not be less than 1' })
  @Max(18, { message: 'Age must not be more than 18' })
  age: string
}

// eslint-disable-next-line camelcase
export default UnsupervisedContactPolicyV4_1
