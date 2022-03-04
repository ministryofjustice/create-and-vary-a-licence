import { ProbationEventMessage } from '../../../@types/events'
import CommunityService from '../../../services/communityService'
import LicenceService from '../../../services/licenceService'

export default class OffenderManagerChangedEventHandler {
  constructor(private readonly communityService: CommunityService, private readonly licenceService: LicenceService) {}

  handle = async (event: ProbationEventMessage): Promise<void> => {
    const { crn } = event
    const offenderManagers = await this.communityService.getAnOffendersManagers(crn)
    const newCom = offenderManagers.find(om => om.isResponsibleOfficer)
    if (newCom) {
      const comDetails = await this.communityService.getStaffDetailByStaffIdentifier(newCom.staffId)

      // If the COM does not have a username, they are assumed to be ineligible for use of this service. (e.g. the "unallocated" staff members)
      if (comDetails?.username) {
        await this.licenceService.updateResponsibleCom(crn, {
          staffIdentifier: comDetails?.staffIdentifier,
          staffUsername: comDetails?.username,
          staffEmail: comDetails?.email,
          firstName: comDetails?.staff?.forenames,
          lastName: comDetails?.staff?.surname,
        })
      }
    }
  }
}
