import HdcService from './hdcService'
import { LicenceApiClient } from '../data'

describe('HDC service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const hdcService = new HdcService(licenceApiClient)

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Get HDC information', () => {
    it('retrieves the HDC information', async () => {
      const exampleHdcInfo = {
        curfewAddress: 'addressLineOne, addressLineTwo, addressTownOrCity, addressPostcode',
        firstDayCurfewTimes: {
          from: '09:00',
          until: '17:00',
        },
        weeklyCurfewTimes: {
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
        },
        prisonTelephone: '0113 318 9547',
        monitoringSupplierTelephone: '0800 137 291',
      }

      const result = await hdcService.getHdcInfo()
      expect(result).toEqual(exampleHdcInfo)
    })
  })
})