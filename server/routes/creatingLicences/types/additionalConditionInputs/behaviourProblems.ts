import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class BehaviourProblems {
  @Expose()
  @IsNotEmpty({ message: 'Select the behaviour problems' })
  behaviourProblems: string[]

  @Expose()
  course: string
}

export default BehaviourProblems
