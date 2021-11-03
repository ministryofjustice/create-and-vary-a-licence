import QRCode from 'qrcode'
import { Licence } from '../@types/licenceApiClientTypes'
import logger from '../../logger'

export default class QrCodeService {
  async getQrCode(licence: Licence): Promise<string> {
    const qrCodeData = {
      id: `${licence.id}`,
      name: `${licence.forename} ${licence.surname}`,
      dob: `${licence.dateOfBirth}`,
      crn: `${licence.crn}`,
      pnc: `${licence.pnc}`,
      start: `${licence.licenceStartDate}`,
      end: `${licence.licenceExpiryDate}`,
    }
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData))
    logger.info(`Encoded QR code data from licence id ${licence.id}`)
    return qrCode
  }
}
