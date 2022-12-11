import { Expose } from 'class-transformer'

class ElectronicMonitoringPeriod {
  @Expose()
  endDate: string

  @Expose()
  infoInputReviewed: boolean
}

export default ElectronicMonitoringPeriod
