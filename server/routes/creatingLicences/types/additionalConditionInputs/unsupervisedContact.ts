import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import RemoveEmptyArrayItems from '../../../../transformers/removeEmptyArrayItems'

class UnsupervisedContact {
  @Expose()
  @IsNotEmpty({ message: 'Enter a gender' })
  gender: string

  @Expose()
  @IsNotEmpty({ message: 'Select an age' })
  age: string

  @Expose()
  @RemoveEmptyArrayItems()
  socialServicesDepartment: string[]
}

export default UnsupervisedContact
