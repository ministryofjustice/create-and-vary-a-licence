import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class WebsiteAccess {
  @Expose()
  @IsNotEmpty({ message: 'Enter the type of website or app' })
  contentType: string
}

export default WebsiteAccess
