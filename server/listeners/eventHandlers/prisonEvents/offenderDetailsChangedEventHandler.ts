import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { convertDateFormat, convertToTitleCase } from '../../../utils/utils'
import { PrisonEventMessage } from '../../../@types/events'

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
        forename: convertToTitleCase(prisoner.firstName),
        middleNames: convertToTitleCase(prisoner.middleName),
        surname: convertToTitleCase(prisoner.lastName),
        dateOfBirth: convertDateFormat(prisoner.dateOfBirth),
      })
    }
  }
}
