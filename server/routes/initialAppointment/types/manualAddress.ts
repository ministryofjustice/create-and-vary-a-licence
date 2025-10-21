import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from 'class-validator'

class ManualAddress {
  @Expose()
  reference?: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a building and street' })
  firstLine: string

  @Expose()
  @IsOptional()
  secondLine: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a town or city' })
  townOrCity: string

  @Expose()
  @IsOptional()
  county: string

  @Expose()
  @IsNotEmpty({ message: 'Enter a postcode' })
  @Transform(({ value }) => {
    if (!value) return value
    let cleaned = value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
    if (cleaned.length > 3) {
      cleaned = `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`
    }
    return cleaned
  })
  @MinLength(5, { message: 'Postcode must be at least 5 characters' })
  @MaxLength(9, { message: 'Postcode must be at most 8 characters' })
  @Matches(/^\s*[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}\s*$/i, {
    message: 'Enter a valid postcode',
  })
  postcode!: string

  @Expose()
  isPreferredAddress?: string
}

export default ManualAddress
