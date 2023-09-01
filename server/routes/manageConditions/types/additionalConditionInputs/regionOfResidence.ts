import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class RegionOfResidence {
  @Expose()
  @IsNotEmpty({ message: 'Select a probation region' })
  probationRegion: string
}

export default RegionOfResidence
