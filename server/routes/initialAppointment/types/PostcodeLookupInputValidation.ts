import { Expose } from 'class-transformer'
import { IsNotEmpty, MaxLength, ValidateIf } from 'class-validator'

class PostcodeLookupInputValidation {
  @Expose()
  actionType: string

  @Expose()
  @ValidateIf(o => o.actionType === 'useSavedAddress')
  @IsNotEmpty({ message: 'Select an address' })
  preferredAddress: string

  @Expose()
  @ValidateIf(o => o.actionType !== 'useSavedAddress')
  @IsNotEmpty({ message: 'Enter address or postcode' })
  @MaxLength(200, { message: 'Address must be 200 characters or less' })
  searchQuery: string
}

export default PostcodeLookupInputValidation
