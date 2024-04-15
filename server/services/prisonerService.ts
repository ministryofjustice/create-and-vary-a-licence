import { Readable } from 'stream'
import fs from 'fs'
import _ from 'lodash'
import { format } from 'date-fns'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import {
  PrisonApiPrisoner,
  PrisonInformation,
  PrisonDetail,
  OffenderSentenceAndOffences,
} from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import logger from '../../logger'
import HdcStatus from '../@types/HdcStatus'
import { User } from '../@types/CvlUserDetails'
import { parseIsoDate } from '../utils/utils'
import { CvlPrisoner } from '../@types/licenceApiClientTypes'

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

  async getPrisonerSentenceAndOffenceDetails(bookingId: number, user?: User): Promise<OffenderSentenceAndOffences[]> {
    return this.prisonApiClient.getPrisonerSentenceAndOffences(bookingId, user)
  }

  async getPrisonerLatestSentenceStartDate(bookingId: number, user?: User): Promise<Date> {
    const sentenceAndOffenceDetails: OffenderSentenceAndOffences[] = await this.getPrisonerSentenceAndOffenceDetails(
      bookingId,
      user
    )
    const sentenceStartDates: Date[] = sentenceAndOffenceDetails.map(details => parseIsoDate(details.sentenceDate))
    return new Date(Math.max(...sentenceStartDates.map(date => date.getTime())))
  }

  async getPrisonInformation(prisonId: string, user?: User): Promise<PrisonInformation> {
    return this.prisonApiClient.getPrisonInformation(prisonId, user)
  }

  async getPrisons(): Promise<PrisonDetail[]> {
    return this.prisonApiClient.getPrisons()
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

    return this.prisonerSearchApiClient.searchPrisonersByBookingIds({ bookingIds }, user)
  }

  async getActiveHdcStatus(bookingId: string): Promise<HdcStatus | null> {
    const hdcLicence = await this.prisonApiClient.getLatestHdcStatus(bookingId)
    if (!hdcLicence || !hdcLicence.bookingId) return null

    const hdcBookingId = hdcLicence.bookingId.toString()

    return {
      approvalStatus: hdcLicence.approvalStatus,
      checksPassed: hdcLicence?.passed,
      bookingId: hdcBookingId,
    }
  }

  async getHdcStatuses(offenders: CvlPrisoner[], user?: User): Promise<HdcStatus[]> {
    const bookingIds = offenders.map(o => parseInt(o.bookingId, 10)).filter(o => o)
    if (bookingIds.length === 0) return []

    const hdcList = []

    /* eslint-disable */
    for (const ids of _.chunk(bookingIds, 500)) {
      const partResult = await this.prisonApiClient.getLatestHdcStatusBatch(ids, user)
      hdcList.push(partResult)
    }
    /* eslint-enable */

    return hdcList.flat().map(
      h =>
        <HdcStatus>{
          bookingId: h.bookingId.toString(),
          approvalStatus: h?.approvalStatus || 'Not found',
          checksPassed: h?.passed || false,
        }
    )
  }

  async isHdcApproved(bookingId: number): Promise<boolean> {
    const prisoners = await this.prisonerSearchApiClient.searchPrisonersByBookingIds({ bookingIds: [bookingId] })
    if (!prisoners.length || !prisoners[0].homeDetentionCurfewActualDate) {
      return false
    }
    const hdcLicence = await this.getActiveHdcStatus(bookingId.toString())
    return !!hdcLicence && hdcLicence.approvalStatus === 'APPROVED'
  }

  async searchPrisonersByReleaseDate(
    earliestReleaseDate: Date,
    latestReleaseDate: Date,
    prisonIds?: string[],
    user?: User
  ): Promise<Prisoner[]> {
    return this.prisonerSearchApiClient
      .searchPrisonersByReleaseDate(
        format(earliestReleaseDate, 'yyyy-MM-dd'),
        format(latestReleaseDate, 'yyyy-MM-dd'),

        prisonIds,
        user
      )
      .then(pageable => pageable.content)
  }
}
