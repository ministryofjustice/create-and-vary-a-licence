import { ProbationEvent } from '../../../@types/events'
import CommunityService from '../../../services/communityService'
import LicenceService from '../../../services/licenceService'

export default class OffenderManagerChangedEventHandler {
  constructor(private readonly communityService: CommunityService, private readonly licenceService: LicenceService) {}

  // TODO: I suspect this is an incorrect interpretation of the meaning of this event?
  // The event occurs when the offender manager for this CRN is changed i.e. A different staff member is allocated.
  // It is probably not raised for a change of details (e.g. email, name) for the existing offender manager?

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
        firstName: comDetails?.staff?.forenames,
        lastName: comDetails?.staff?.surname,
      })
    }
  }
}
