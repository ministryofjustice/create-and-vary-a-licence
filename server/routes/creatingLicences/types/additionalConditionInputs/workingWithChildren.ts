import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class WorkingWithChildren {
  @Expose()
  @IsNotEmpty({ message: 'Select whether the person is under 16 or under 18 years' })
  age: string
}

export default WorkingWithChildren
