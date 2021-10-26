import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class WorkingWithChildren {
  @Expose()
  @IsNotEmpty({ message: 'Select an age' })
  age: string
}

export default WorkingWithChildren
