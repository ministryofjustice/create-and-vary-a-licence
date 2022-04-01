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
