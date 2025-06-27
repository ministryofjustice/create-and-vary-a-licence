import { Expose } from 'class-transformer'
import { IsDefined } from 'class-validator'

class ElectronicMonitoringProvider {
  @Expose()
  @IsDefined({ message: 'You must answer if they are tagged as part of a pathfinder or programme' })
  isToBeTaggedForProgramme: boolean

  @Expose()
  programmeName: string
}

export default ElectronicMonitoringProvider
