import { Expose } from 'class-transformer'
import { IsNotEmpty, IsIn, ValidateIf } from 'class-validator'
import YesOrNo from '../../../enumeration/yesOrNo'

const message = 'Choose how you will create this licence'

class CreateLicenceInNomisOrCvl {
  @Expose()
  @IsNotEmpty({ message })
  @IsIn(Object.values(YesOrNo), { message })
  answer: YesOrNo

  @Expose()
  @ValidateIf(o => o.answer === YesOrNo.NO)
  @IsNotEmpty({ message: 'You must add a reason for using NOMIS' })
  reasonForUsingNomis: string
}

export default CreateLicenceInNomisOrCvl
