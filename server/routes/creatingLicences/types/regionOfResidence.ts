import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class RegionOfResidence {
  @Expose()
  @IsNotEmpty({ message: 'Enter the probation region' })
  regionOfResidence: string
}

export default RegionOfResidence
