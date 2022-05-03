import { ProbationEventMessage } from '../../../@types/events'
import CommunityService from '../../../services/communityService'
import LicenceService from '../../../services/licenceService'

const COM_ROLE_ID = 'LHDCBT002'

export default class OffenderManagerChangedEventHandler {
  constructor(private readonly communityService: CommunityService, private readonly licenceService: LicenceService) {}

  handle = async (event: ProbationEventMessage): Promise<void> => {
    const { crn } = event
    const deliusRecord = await this.communityService.getProbationer({ crn })
    const offenderManagers = await this.communityService.getAnOffendersManagers(crn)

    const responsibleOfficer = deliusRecord.offenderManagers.find(om => om.active)
    const newCom = offenderManagers.find(om => om.staffCode === responsibleOfficer.staff.code)

    if (newCom) {
      const comDetails = await this.communityService.getStaffDetailByStaffIdentifier(newCom.staffId)

      // If the COM does not have a username, they are assumed to be ineligible for use of this service. (e.g. the "unallocated" staff members)
      if (comDetails?.username) {
        // Assign the com role to the user if they do not have it already
        const userDetails = await this.communityService.getUserDetailsByUsername(comDetails.username)
        if (userDetails.roles.find(role => role.name === COM_ROLE_ID) === undefined) {
          await this.communityService.assignDeliusRole(comDetails.username.trim().toUpperCase(), COM_ROLE_ID)
        }

        await Promise.all([
          this.licenceService.updateResponsibleCom(crn, {
            staffIdentifier: comDetails?.staffIdentifier,
            staffUsername: comDetails?.username,
            staffEmail: comDetails?.email,
            firstName: comDetails?.staff?.forenames,
            lastName: comDetails?.staff?.surname,
          }),
          this.licenceService.updateProbationTeam(crn, {
            probationAreaCode: newCom.probationArea?.code,
            probationAreaDescription: newCom.probationArea?.description,
            probationPduCode: newCom.team?.borough?.code,
            probationPduDescription: newCom.team?.borough?.description,
            probationLauCode: newCom.team?.district?.code,
            probationLauDescription: newCom.team?.district?.description,
            probationTeamCode: newCom.team?.code,
            probationTeamDescription: newCom.team?.description,
          }),
        ])
      }
    }
  }
}
