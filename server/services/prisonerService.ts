import { Readable } from 'stream'
import fs from 'fs'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { PrisonApiPrisoner, PrisonInformation } from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import logger from '../../logger'
import HdcStatus from '../@types/HdcStatus'

export default class PrisonerService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  // For streaming into HTML templates directly
  async getPrisonerImage(username: string, nomsId: string): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new PrisonApiClient(token).getPrisonerImage(nomsId)
  }

  // For embedding into PDF documents as base64 jpeg or png data string
  async getPrisonerImageData(username: string, nomsId: string): Promise<string> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    let base64String
    try {
      const image = await new PrisonApiClient(token).getPrisonerImageData(nomsId)
      base64String = image.toString('base64')
    } catch (error) {
      logger.info(`No image data found for ${nomsId} - sending placeholder image`)
      const content = await fs.readFileSync('assets/images/image-missing.png')
      base64String = Buffer.from(content).toString('base64')
    }
    return base64String
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

  async getHdcStatuses(username: string, offenders: Prisoner[]): Promise<HdcStatus[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookingIds = offenders.map(o => parseInt(o.bookingId, 10)).filter(o => o)
    logger.info(`getHdcStatus for bookingIds = ${JSON.stringify(bookingIds)}`)
    const hdcList = await new PrisonApiClient(token).getLatestHdcStatusBatch(bookingIds)
    return hdcList.map(h => {
      const hdcEligibilityDate = offenders.find(
        o => parseInt(o?.bookingId, 10) === h?.bookingId
      )?.homeDetentionCurfewEligibilityDate
      return new HdcStatus(`${h?.bookingId}`, hdcEligibilityDate, h?.passed, h?.approvalStatus)
    })
  }
}
