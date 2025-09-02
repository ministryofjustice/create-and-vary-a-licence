import { Expose } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'

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
  searchQuery: string
}

export default PostcodeLookupInputValidation
