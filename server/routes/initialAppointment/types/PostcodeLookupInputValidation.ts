import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class PostcodeLookupInputValidation {
  @Expose()
  @IsNotEmpty({ message: 'Enter address or postcode' })
  searchQuery: string
}

export default PostcodeLookupInputValidation
