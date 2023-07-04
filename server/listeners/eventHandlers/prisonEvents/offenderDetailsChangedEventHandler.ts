import { PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { convertDateFormat } from '../../../utils/utils'


export default class OffenderDetailsChangedEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: PrisonEventMessage) => {
    const { bookingId, offenderIdDisplay } = event
    const nomisId =
      offenderIdDisplay ||
      (await this.prisonerService.searchPrisonersByBookingIds([bookingId])).map(o => o.prisonerNumber).pop()
    const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)

    if (prisoner) {
      await this.licenceService.updateOffenderDetails(nomisId, {
        forename: prisoner.firstName,
        middleNames: prisoner.middleName,
        surname: prisoner.lastName,
        dateOfBirth: convertDateFormat(prisoner.dateOfBirth),
      })
    }
  }
}
