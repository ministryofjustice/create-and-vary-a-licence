import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class OutOfBoundsRegion {
  @Expose()
  @IsNotEmpty({ message: 'Enter the name of the area shown in the attached map' })
  outOfBoundArea: string

  @Expose()
  @IsNotEmpty({ message: 'You must attach an exclusion zone MapMaker PDF file' })
  outOfBoundFilename: string
}

export default OutOfBoundsRegion
