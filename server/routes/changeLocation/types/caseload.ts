import { Expose } from 'class-transformer'
import { ArrayNotEmpty } from 'class-validator'

class Caseload {
  @Expose()
  @ArrayNotEmpty({ message: 'Select one or multiple locations.' })
  caseload: string[]
}

export default Caseload
