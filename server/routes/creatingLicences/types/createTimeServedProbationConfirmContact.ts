import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty, ArrayNotEmpty, IsArray, ValidateIf, IsString } from 'class-validator'
import { type TimeServedProbationConfirmContactRequest } from '../../../@types/licenceApiClientTypes'

type ContactStatus = TimeServedProbationConfirmContactRequest['contactStatus']
type CommunicationMethod = TimeServedProbationConfirmContactRequest['communicationMethods'][number]

export class CreateTimeServedProbationConfirmContact {
  @Expose()
  @IsNotEmpty({ message: 'Confirm if you have contacted the probation team' })
  contactStatus: ContactStatus

  @Expose()
  @Transform(({ value }) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return [value]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Choose a form of communication' })
  communicationMethods: CommunicationMethod[]

  @Expose()
  @ValidateIf(o => o.communicationMethods?.includes('OTHER'))
  @IsNotEmpty({ message: 'Enter a form of communication' })
  @IsString()
  otherCommunicationDetail?: string
}

export default CreateTimeServedProbationConfirmContact
