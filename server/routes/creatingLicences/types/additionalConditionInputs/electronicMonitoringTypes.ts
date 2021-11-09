import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

class ElectronicMonitoringTypes {
  @Expose()
  @IsNotEmpty({ message: 'Select the options that apply' })
  electronicMonitoringTypes: string[]
}

export default ElectronicMonitoringTypes
