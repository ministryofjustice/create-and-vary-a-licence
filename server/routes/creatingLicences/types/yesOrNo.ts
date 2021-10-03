import { Expose } from 'class-transformer'
import { IsIn, IsNotEmpty } from 'class-validator'
import YesOrNo from '../../../enumeration/yesOrNo'

const message = 'Select yes or no'

class YesOrNoQuestion {
  @Expose()
  @IsNotEmpty({ message })
  @IsIn(Object.values(YesOrNo), { message })
  answer: YesOrNo
}

export default YesOrNoQuestion
