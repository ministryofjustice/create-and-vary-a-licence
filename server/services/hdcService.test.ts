import HdcService from './hdcService'
import LicenceApiClient from '../data/licenceApiClient'

jest.mock('../data/licenceApiClient')

describe('HDC Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const hdcService = new HdcService(licenceApiClient)

  const exampleHdcLicenceData = {
    curfewAddress: {
      addressLine1: 'addressLineOne',
      addressLine2: 'addressLineTwo',
      addressTown: 'addressTownOrCity',
      postCode: 'addressPostcode',
    },
    firstNightCurfewHours: {
      firstNightFrom: '09:00',
      firstNightUntil: '17:00',
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Get HDC information', () => {
    it('Should retrieve HDC information', async () => {
      licenceApiClient.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      const result = await hdcService.getHdcLicenceData(1)
      expect(result).toEqual(exampleHdcLicenceData)
      expect(licenceApiClient.getHdcLicenceData).toHaveBeenCalledWith(1)
    })
  })
})
