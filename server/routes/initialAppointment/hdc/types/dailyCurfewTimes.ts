import { Expose, Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator'
import DailyCurfewTime from './dailyCurfewTime'

class DailyCurfewTimes {
  @Expose()
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => DailyCurfewTime)
  curfews: DailyCurfewTime[]
}

export default DailyCurfewTimes
