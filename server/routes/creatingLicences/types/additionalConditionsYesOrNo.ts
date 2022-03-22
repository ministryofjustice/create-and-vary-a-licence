import { Expose } from 'class-transformer'
import { IsIn, IsNotEmpty } from 'class-validator'
import YesOrNo from '../../../enumeration/yesOrNo'

const message = 'Select yes or not applicable'

class AdditionalConditionsYesOrNo {
  @Expose()
  @IsNotEmpty({ message })
  @IsIn(Object.values(YesOrNo), { message })
  answer: YesOrNo
}

export default AdditionalConditionsYesOrNo
