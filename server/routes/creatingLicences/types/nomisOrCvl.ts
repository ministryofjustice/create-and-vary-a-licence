import { Expose } from 'class-transformer'
import { IsNotEmpty, IsIn, ValidateIf } from 'class-validator'
import YesOrNo from '../../../enumeration/yesOrNo'

const message = 'Select yes or no'

class NomisOrCvl {
  @Expose()
  @ValidateIf(o => o.answer === YesOrNo.NO)
  @IsNotEmpty({ message: 'You must add a reason for using NOMIS' })
  reasonForUsingNomis: string

  @Expose()
  @IsNotEmpty({ message })
  @IsIn(Object.values(YesOrNo), { message })
  answer: YesOrNo
}

export default NomisOrCvl
