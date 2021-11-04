import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class BehaviourProblems {
  @Expose()
  @IsNotEmpty({ message: 'Select the behaviour problems' })
  behaviourProblems: string[]
}

export default BehaviourProblems
