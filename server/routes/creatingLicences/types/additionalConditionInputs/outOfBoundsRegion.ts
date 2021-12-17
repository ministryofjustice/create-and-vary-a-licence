import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class OutOfBoundsRegion {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the area on the map' })
  outOfBoundArea: string

  @Expose()
  @IsNotEmpty()
  outOfBoundFilename: string
}

export default OutOfBoundsRegion
