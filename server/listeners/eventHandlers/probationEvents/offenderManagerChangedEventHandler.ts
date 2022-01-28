import { ProbationEvent } from '../../../@types/events'
import CommunityService from '../../../services/communityService'
import LicenceService from '../../../services/licenceService'

export default class OffenderManagerChangedEventHandler {
  constructor(private readonly communityService: CommunityService, private readonly licenceService: LicenceService) {}

  handle = async (event: ProbationEvent): Promise<void> => {
    const { crn } = event
    const offenderManagers = await this.communityService.getAnOffendersManagers(crn)
    const newCom = offenderManagers.find(om => om.isResponsibleOfficer)
    if (newCom) {
      const comDetails = await this.communityService.getStaffDetailByStaffIdentifier(newCom.staffId)
      await this.licenceService.updateResponsibleCom(crn, {
        staffIdentifier: comDetails?.staffIdentifier,
        staffUsername: comDetails?.username,
        staffEmail: comDetails?.email,
      })
    }
  }
}
