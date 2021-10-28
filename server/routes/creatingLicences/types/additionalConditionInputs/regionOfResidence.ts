import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class RegionOfResidence {
  @Expose()
  @IsNotEmpty({ message: 'Enter the probation region' })
  probationRegion: string
}

export default RegionOfResidence
