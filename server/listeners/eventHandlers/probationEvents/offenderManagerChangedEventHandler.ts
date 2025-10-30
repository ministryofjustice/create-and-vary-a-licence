import logger from '../../../../logger'
import { ProbationEventMessage } from '../../../@types/events'
import ProbationService from '../../../services/probationService'
import LicenceService from '../../../services/licenceService'

export default class OffenderManagerChangedEventHandler {
  constructor(
    private readonly probationService: ProbationService,
    private readonly licenceService: LicenceService,
  ) {}

  handle = async (event: ProbationEventMessage): Promise<void> => {
    const { crn } = event
    const newCom = await this.probationService.getResponsibleCommunityManager(crn)

    logger.info(`responsible officer code for crn ${crn} is ${newCom?.code}`)

    if (newCom) {
      // If the COM does not have a username, they are assumed to be ineligible for use of this service. (e.g. the "unallocated" staff members)
      if (newCom.username) {
        // Assign the com role to the user if they do not have it already
        await this.probationService.assignDeliusRole(newCom.username.trim().toUpperCase())

        await this.licenceService.updateResponsibleCom(crn, {
          staffIdentifier: newCom.id,
          staffCode: newCom.code,
          staffUsername: newCom.username,
          staffEmail: newCom.email,
          firstName: newCom.name?.forename,
          lastName: newCom.name?.surname,
        })
        await this.licenceService.updateProbationTeam(crn, {
          probationAreaCode: newCom.provider?.code,
          probationAreaDescription: newCom.provider?.description,
          probationPduCode: newCom.team?.borough?.code,
          probationPduDescription: newCom.team?.borough?.description,
          probationLauCode: newCom.team?.district?.code,
          probationLauDescription: newCom.team?.district?.description,
          probationTeamCode: newCom.team?.code,
          probationTeamDescription: newCom.team?.description,
        })
      }
    } else {
      logger.info(`newCom not found for crn: ${crn}`)
    }
  }
}
