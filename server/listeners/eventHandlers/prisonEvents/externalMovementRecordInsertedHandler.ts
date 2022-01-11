import LicenceService from '../../../services/licenceService'
import logger from '../../../../logger'
import { PrisonEvent } from '../../../@types/prisonApiClientTypes'

export default class ExternalMovementRecordInsertedHandler {
  constructor(private readonly licenceService: LicenceService) {}

  handle = async (event: PrisonEvent): Promise<void> => {
    logger.info(event)
  }
}
