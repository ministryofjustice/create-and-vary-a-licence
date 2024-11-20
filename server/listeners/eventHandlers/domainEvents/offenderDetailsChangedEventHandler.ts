import { DomainEventMessage } from '../../../@types/events'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { convertDateFormat, convertToTitleCase } from '../../../utils/utils'

export default class OffenderDetailsChangedEventHandler {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService,
  ) {}

  handle = async (event: DomainEventMessage) => {
    const { nomsNumber } = event.additionalInformation
    const prisoner = await this.prisonerService.getPrisonerDetail(nomsNumber)

    if (prisoner) {
      await this.licenceService.updateOffenderDetails(nomsNumber, {
        forename: convertToTitleCase(prisoner.firstName),
        middleNames: convertToTitleCase(prisoner.middleName),
        surname: convertToTitleCase(prisoner.lastName),
        dateOfBirth: convertDateFormat(prisoner.dateOfBirth),
      })
    }
  }
}
