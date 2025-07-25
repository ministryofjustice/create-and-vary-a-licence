import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class PostcodeLookupAddress {
  @Expose()
  @IsNotEmpty({ message: 'Select address' })
  selectedAddress: string // This will be the JSON string
}

export default PostcodeLookupAddress
