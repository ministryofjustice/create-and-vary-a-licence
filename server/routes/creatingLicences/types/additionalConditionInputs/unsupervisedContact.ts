import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class UnsupervisedContact {
  @Expose()
  @IsNotEmpty({ message: 'Enter a gender' })
  gender: string

  @Expose()
  @IsNotEmpty({ message: 'Select an age' })
  age: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a social services department' })
  socialServicesDepartment: string
}

export default UnsupervisedContact
