import { HdcFirstDayCurfewFromUntil, HdcInfo, HdcWeeklyCurfewFromUntil } from '../@types/HdcLicence'
import { Licence } from '../@types/licenceApiClientTypes'
import config from '../config'
import LicenceApiClient from '../data/licenceApiClient'

export default class HdcService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getHdcInfo(licence: Licence): Promise<HdcInfo> {
    const curfewAddress: string = 'addressLineOne, addressLineTwo, addressTownOrCity, addressPostcode'

    const firstDayCurfewTimes: HdcFirstDayCurfewFromUntil = {
      from: '09:00',
      until: '17:00',
    }
    const weeklyCurfewTimes: HdcWeeklyCurfewFromUntil = {
      monday: {
        from: '09:00',
        until: '17:00',
      },
      tuesday: {
        from: '09:00',
        until: '17:00',
      },
      wednesday: {
        from: '09:00',
        until: '17:00',
      },
      thursday: {
        from: '09:00',
        until: '17:00',
      },
      friday: {
        from: '09:00',
        until: '17:00',
      },
      saturday: {
        from: '09:00',
        until: '17:00',
      },
      sunday: {
        from: '09:00',
        until: '17:00',
      },
    }
    const prisonTelephone = '0113 318 9547'
    const { monitoringSupplierTelephone } = config
    return {
      curfewAddress,
      firstDayCurfewTimes,
      weeklyCurfewTimes,
      prisonTelephone,
      monitoringSupplierTelephone,
    }
  }
}
