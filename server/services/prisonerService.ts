import { Readable } from 'stream'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { PrisonApiPrisoner, PrisonInformation } from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import logger from '../../logger'

export default class PrisonerService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  // For streaming into templates directly
  async getPrisonerImage(username: string, nomsId: string): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new PrisonApiClient(token).getPrisonerImage(nomsId)
  }

  // For embedding into PDF documents as base64 jpeg data
  async getPrisonerImageData(username: string, nomsId: string): Promise<string> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    let image = null
    try {
      image = await new PrisonApiClient(token).getPrisonerImageData(nomsId)
    } catch (error) {
      // TODO: Read the placeholder image here? From assets
      logger.info(`No image data found for ${nomsId} - sending placeholder image`)
      image = Buffer.from('')
    }
    return image.toString('base64')
  }

  async getPrisonerDetail(username: string, nomsId: string): Promise<PrisonApiPrisoner> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new PrisonApiClient(token).getPrisonerDetail(nomsId)
  }

  async getPrisonInformation(username: string, prisonId: string): Promise<PrisonInformation> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new PrisonApiClient(token).getPrisonInformation(prisonId)
  }

  async searchPrisoners(username: string, prisonerSearchCriteria: PrisonerSearchCriteria): Promise<Prisoner[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new PrisonerSearchApiClient(token).searchPrisoners(prisonerSearchCriteria)
  }

  async searchPrisonersByNomisIds(username: string, nomisIds: string[]): Promise<Prisoner[]> {
    if (nomisIds.length < 1) {
      return []
    }
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const prisonerSearchCriteria = {
      prisonerNumbers: nomisIds,
    }
    return new PrisonerSearchApiClient(token).searchPrisonersByNomsIds(prisonerSearchCriteria)
  }
}
