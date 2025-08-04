import { Expose } from 'class-transformer'
import { IsIn, IsNotEmpty } from 'class-validator'
import { YesOrNotApplicable } from '../../../enumeration/YesOrNotApplicable'

const message = 'Select yes or not applicable'

class YesOrNotApplicableDto {
  @Expose()
  @IsNotEmpty({ message })
  @IsIn(Object.values(YesOrNotApplicable), { message })
  answer: YesOrNotApplicable
}

export default YesOrNotApplicableDto
