import { Expose } from 'class-transformer'
import { IsIn, IsNotEmpty } from 'class-validator'

const message = 'Select either Yes or No'

class YesOrNoQuestion {
  @Expose()
  @IsNotEmpty({ message })
  @IsIn(['yes', 'no'], { message })
  answer: string
}

export default YesOrNoQuestion
