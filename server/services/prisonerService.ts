import { Readable } from 'stream'
import fs from 'fs'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { PrisonApiPrisoner, PrisonInformation } from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import logger from '../../logger'
import HdcStatus from '../@types/HdcStatus'

export default class PrisonerService {
  constructor(
    private readonly prisonApiClient: PrisonApiClient,
    private readonly prisonerSearchApiClient: PrisonerSearchApiClient
  ) {}

  // For streaming into HTML templates directly
  async getPrisonerImage(username: string, nomsId: string): Promise<Readable> {
    return this.prisonApiClient.getPrisonerImage(nomsId, username)
  }

  // For embedding into PDF documents as base64 jpeg or png data string
  async getPrisonerImageData(username: string, nomsId: string): Promise<string> {
    let base64String
    try {
      const image = await this.prisonApiClient.getPrisonerImageData(nomsId, username)
      base64String = image.toString('base64')
    } catch (error) {
      logger.info(`No image data found for ${nomsId} - sending placeholder image`)
      const content = await fs.readFileSync('assets/images/image-missing.png')
      base64String = Buffer.from(content).toString('base64')
    }
    return base64String
  }

  async getPrisonerDetail(username: string, nomsId: string): Promise<PrisonApiPrisoner> {
    return this.prisonApiClient.getPrisonerDetail(nomsId, username)
  }

  async getPrisonInformation(username: string, prisonId: string): Promise<PrisonInformation> {
    return this.prisonApiClient.getPrisonInformation(prisonId, username)
  }

  async searchPrisoners(username: string, prisonerSearchCriteria: PrisonerSearchCriteria): Promise<Prisoner[]> {
    return this.prisonerSearchApiClient.searchPrisoners(prisonerSearchCriteria, username)
  }

  async searchPrisonersByNomisIds(username: string, nomisIds: string[]): Promise<Prisoner[]> {
    if (nomisIds.length < 1) {
      return []
    }
    const prisonerSearchCriteria = {
      prisonerNumbers: nomisIds,
    }
    return this.prisonerSearchApiClient.searchPrisonersByNomsIds(prisonerSearchCriteria, username)
  }

  async getHdcStatuses(username: string, offenders: Prisoner[]): Promise<HdcStatus[]> {
    const bookingIds = offenders.map(o => parseInt(o.bookingId, 10)).filter(o => o)
    logger.info(`getHdcStatus for bookingIds = ${JSON.stringify(bookingIds)}`)
    if (bookingIds.length === 0) {
      return []
    }
    const hdcList = await this.prisonApiClient.getLatestHdcStatusBatch(bookingIds, username)
    return hdcList.map(h => {
      const hdcEligibilityDate = offenders.find(
        o => parseInt(o?.bookingId, 10) === h?.bookingId
      )?.homeDetentionCurfewEligibilityDate
      return new HdcStatus(`${h?.bookingId}`, hdcEligibilityDate, h?.passed, h?.approvalStatus)
    })
  }
}
