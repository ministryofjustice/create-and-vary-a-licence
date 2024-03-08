import { Request, Response } from 'express'
import LicenceType from '../../../enumeration/licenceType'
import CommunityService from '../../../services/communityService'
import config from '../../../config'

export default class ConfirmApprovedRoutes {
  constructor(private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { comUsername } = res.locals.licence
    const comDetails = await this.communityService.getStaffDetailByUsername(comUsername)

    let titleText
    let confirmationMessage

    switch (licence.typeCode) {
      case LicenceType.AP_PSS:
        titleText = `Licence and post sentence supervision order approved`
        confirmationMessage = `A case administrator can now print the licence and post sentence supervision order for ${licence.forename} ${licence.surname}.`
        break
      case LicenceType.AP:
        titleText = `Licence approved`
        confirmationMessage = `A case administrator can now print the licence for ${licence.forename} ${licence.surname}.`
        break
      case LicenceType.PSS:
        titleText = `Post sentence supervision order approved`
        confirmationMessage = `A case administrator can now print the post sentence supervision order for ${licence.forename} ${licence.surname}.`
        break
      default: {
        // silently ignore
      }
    }

    if (config.hardStopEnabled) {
      if (comDetails?.email != null) {
        confirmationMessage +=
          '\nWe will email the probation practitioner automatically to tell them this licence has been approved.'
      } else {
        confirmationMessage +=
          '\nA case administrator still needs to notify the probation team that this licence has been approved. We do not have their contact details to do this automatically.'
      }
    }

    res.render('pages/approve/confirmation', { titleText, confirmationMessage })
  }
}
