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
      const exampleHdcLicenceData = {
        curfewAddress: {
          addressLine1: 'addressLineOne',
          addressLine2: 'addressLineTwo',
          addressTown: 'addressTownOrCity',
          postcode: 'addressPostcode',
        },
        firstNightCurfewHours: {
          firstNightFrom: '09:00',
          firstNightTo: '17:00',
        },
        curfewHours: {
          mondayFrom: '17:00',
          mondayUntil: '09:00',
          tuesdayFrom: '17:00',
          tuesdayUntil: '09:00',
          wednesdayFrom: '17:00',
          wednesdayUntil: '09:00',
          thursdayFrom: '17:00',
          thursdayUntil: '09:00',
          fridayFrom: '17:00',
          fridayUntil: '09:00',
          saturdayFrom: '17:00',
          saturdayUntil: '09:00',
          sundayFrom: '17:00',
          sundayUntil: '09:00',
        },
      }
      const result = await hdcService.getHdcLicenceData(1)
      expect(result).toEqual(exampleHdcLicenceData)
    })
  })
})
