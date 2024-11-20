import { Expose } from 'class-transformer'
import { IsNotEmpty, Matches } from 'class-validator'

class Telephone {
  @Expose()
  @IsNotEmpty({ message: 'Enter a telephone number' })
  @Matches(
    /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{3,4}\s?\d{4}))(\s?\\#(\d{4}|\d{3}))?$/,
    { message: 'Enter a phone number in the correct format, like 01632 960901' },
  )
  telephone: string
}

export default Telephone
