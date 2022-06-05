import { Readable } from 'stream'
import fs from 'fs'
import { Moment } from 'moment'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { PrisonApiPrisoner, PrisonInformation } from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import logger from '../../logger'
import HdcStatus from '../@types/HdcStatus'
import { User } from '../@types/CvlUserDetails'

export default class PrisonerService {
  constructor(
    private readonly prisonApiClient: PrisonApiClient,
    private readonly prisonerSearchApiClient: PrisonerSearchApiClient
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
    } catch (error) {
      logger.info(`No image data found for ${nomsId} - sending placeholder image`)
      const content = fs.readFileSync('assets/images/image-missing.png')
      base64String = content.toString('base64')
    }
    return base64String
  }

  async getPrisonerDetail(nomsId: string, user?: User): Promise<PrisonApiPrisoner> {
    return this.prisonApiClient.getPrisonerDetail(nomsId, user)
  }

  async getPrisonInformation(prisonId: string, user?: User): Promise<PrisonInformation> {
    return this.prisonApiClient.getPrisonInformation(prisonId, user)
  }

  async searchPrisoners(prisonerSearchCriteria: PrisonerSearchCriteria, user?: User): Promise<Prisoner[]> {
    return this.prisonerSearchApiClient.searchPrisoners(prisonerSearchCriteria, user)
  }

  async searchPrisonersByNomisIds(nomisIds: string[], user: User): Promise<Prisoner[]> {
    if (nomisIds.length < 1) {
      return []
    }
    const prisonerSearchCriteria = {
      prisonerNumbers: nomisIds,
    }
    return this.prisonerSearchApiClient.searchPrisonersByNomsIds(prisonerSearchCriteria, user)
  }

  async searchPrisonersByBookingIds(bookingIds: number[], user?: User): Promise<Prisoner[]> {
    if (bookingIds.length < 1) {
      return []
    }
    const prisonerSearchCriteria = {
      bookingIds,
    }
    return this.prisonerSearchApiClient.searchPrisonersByBookingIds(prisonerSearchCriteria, user)
  }

  async getActiveHdcStatus(bookingId: string): Promise<HdcStatus | null> {
    const hdcLicence = await this.prisonApiClient.getLatestHdcStatus(bookingId)
    if (!hdcLicence) return null

    const hdcBookingId = hdcLicence.bookingId.toString()

    return {
      approvalStatus: hdcLicence.approvalStatus,
      checksPassed: hdcLicence?.passed,
      bookingId: hdcBookingId,
    }
  }

  async getHdcStatuses(offenders: Prisoner[], user?: User): Promise<HdcStatus[]> {
    const bookingIds = offenders.map(o => parseInt(o.bookingId, 10)).filter(o => o)
    if (bookingIds.length === 0) return []

    const hdcList = await this.prisonApiClient.getLatestHdcStatusBatch(bookingIds, user)

    return hdcList.map(
      h =>
        <HdcStatus>{
          bookingId: h.bookingId.toString(),
          approvalStatus: h?.approvalStatus || 'Not found',
          checksPassed: h?.passed || false,
        }
    )
  }

  async hdcLicenceIsApproved(bookingId: string): Promise<boolean> {
    const hdcLicence = await this.getActiveHdcStatus(bookingId)
    return !!hdcLicence && hdcLicence.approvalStatus === 'APPROVED'
  }

  async searchPrisonersByReleaseDate(
    earliestReleaseDate: Moment,
    latestReleaseDate: Moment,
    prisonIds?: string[],
    user?: User
  ): Promise<Prisoner[]> {
    return this.prisonerSearchApiClient
      .searchPrisonersByReleaseDate(
        earliestReleaseDate.format('YYYY-MM-DD'),
        latestReleaseDate.format('YYYY-MM-DD'),
        prisonIds,
        user
      )
      .then(pageable => pageable.content)
  }
}
