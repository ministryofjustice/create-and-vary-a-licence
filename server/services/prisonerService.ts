import { Readable } from 'stream'
import fs from 'fs'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { PrisonDetail } from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import logger from '../../logger'
import { User } from '../@types/CvlUserDetails'

export default class PrisonerService {
  constructor(
    private readonly prisonApiClient: PrisonApiClient,
    private readonly prisonerSearchApiClient: PrisonerSearchApiClient,
  ) {}

  // For streaming into HTML templates directly
  async getPrisonerImage(nomsId: string, user: User): Promise<Readable> {
    return this.prisonApiClient.getPrisonerImage(nomsId, user)
  }

  // For embedding into PDF documents as base64 jpeg or png data string
  async getPrisonerImageData(nomsId: string, user: User): Promise<string> {
    let base64String
    try {
      const image = await this.prisonApiClient.getPrisonerImageData(nomsId, user)
      base64String = image.toString('base64')
    } catch (_error) {
      logger.info(`No image data found for ${nomsId} - sending placeholder image`)
      const content = fs.readFileSync('assets/images/image-missing.png')
      base64String = content.toString('base64')
    }
    return base64String
  }

  async getPrisons(): Promise<PrisonDetail[]> {
    return this.prisonApiClient.getPrisons()
  }

  async searchPrisoners(prisonerSearchCriteria: PrisonerSearchCriteria, user?: User): Promise<Prisoner[]> {
    return this.prisonerSearchApiClient.searchPrisoners(prisonerSearchCriteria, user)
  }
}
