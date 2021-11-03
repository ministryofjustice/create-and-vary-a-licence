import QrCodeService from './qrCodeService'
import { Licence } from '../@types/licenceApiClientTypes'

describe('QR Code Service', () => {
  let licence: Licence
  const qrCodeService = new QrCodeService()

  beforeEach(() => {
    licence = {
      id: '1',
      typeCode: 'AP',
      forename: 'John',
      surname: 'Bloggs',
      dateOfBirth: '21/10/1990',
      crn: 'CRN',
      pnc: 'PNC',
    } as unknown as Licence
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('generate a QR code', async () => {
    const qrCode = await qrCodeService.getQrCode(licence)
    expect(qrCode.length).toBeGreaterThan(60)
    expect(qrCode).toContain('data:image/png;base64')
  })
})
