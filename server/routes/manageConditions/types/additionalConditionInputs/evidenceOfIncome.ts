import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class EvidenceOfIncome {
  @Expose()
  @IsNotEmpty({ message: 'Select all that apply' })
  evidenceOfIncome: string[]
}

export default EvidenceOfIncome
