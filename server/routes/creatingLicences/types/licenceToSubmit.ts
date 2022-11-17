import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import AdditionalConditions from './additionalConditions'
import ConditionsHaveBeenExpanded from '../../../validators/conditionsHaveBeenExpanded'

class LicenceToSubmit {
  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add who to meet" })
  appointmentPerson: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment address" })
  appointmentAddress: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment telephone number" })
  appointmentContact: string

  @Expose()
  @IsNotEmpty({ message: "Select 'Change' to go back and add appointment date and time" })
  appointmentTime: string

  @Expose()
  @ConditionsHaveBeenExpanded({
    message:
      'At least one of the additional conditions you have chosen is incomplete. Check the conditions and add the missing information or remove any conditions you do not need',
  })
  additionalLicenceConditions: AdditionalConditions[]

  @Expose()
  @ConditionsHaveBeenExpanded({
    message:
      'At least one of the additional PSS requirements you have chosen is incomplete. Check the requirements and add the missing information or remove any requirements you do not need',
  })
  additionalPssConditions: AdditionalConditions[]
}

export default LicenceToSubmit
