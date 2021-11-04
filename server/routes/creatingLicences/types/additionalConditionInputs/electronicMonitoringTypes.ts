import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ElectronicMonitoringTypes {
  @Expose()
  @IsNotEmpty({ message: 'Select the options that apply, like exclusion zone and curfew' })
  electronicMonitoringTypes: string[]
}

export default ElectronicMonitoringTypes
