import { DomainEventMessage } from '../../../@types/events'
import type { LicenceApiClient } from '../../../data'

export default class ReleaseEventHandler {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  handle = async (event: DomainEventMessage): Promise<void> => {
    if (event.additionalInformation?.reason !== 'RELEASED') return

    const nomisId = event.additionalInformation.nomsNumber

    await this.licenceApiClient.triggerReleaseProcess(nomisId)
  }
}
