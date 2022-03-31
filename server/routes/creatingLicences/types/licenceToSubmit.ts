import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import AdditionalConditions from './additionalConditions'
import ConditionsHaveBeenExpanded from '../../../validators/conditionsHaveBeenExpanded'

class LicenceToSubmit {
  @Expose()
  @IsNotEmpty({ message: 'The person to meet at the induction meeting must be entered' })
  appointmentPerson: string

  @Expose()
  @IsNotEmpty({ message: 'The address of the induction meeting must be entered' })
  appointmentAddress: string

  @Expose()
  @IsNotEmpty({ message: 'The telephone number for the induction meeting must be entered' })
  appointmentContact: string

  @Expose()
  @IsNotEmpty({ message: 'The date and time of the induction meeting must be entered' })
  appointmentTime: string

  @Expose()
  @ConditionsHaveBeenExpanded({
    message: "Select 'Change' to go back and add text to the licence condition",
  })
  additionalLicenceConditions: AdditionalConditions[]

  @Expose()
  @ConditionsHaveBeenExpanded({
    message: "Select 'Change' to go back and add text to the PSS requirement",
  })
  additionalPssConditions: AdditionalConditions[]
}

export default LicenceToSubmit
