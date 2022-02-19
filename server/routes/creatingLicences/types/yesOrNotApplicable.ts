import { Expose } from 'class-transformer'
import { IsIn, IsNotEmpty } from 'class-validator'
import YesOrNo from '../../../enumeration/yesOrNo'

const message = 'Select yes or not applicable'

class YesOrNotApplicable {
  @Expose()
  @IsNotEmpty({ message })
  @IsIn(Object.values(YesOrNo), { message })
  answer: YesOrNo
}

export default YesOrNotApplicable
