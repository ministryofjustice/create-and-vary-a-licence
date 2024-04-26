import moment from 'moment'
import type { Licence, CvlPrisoner } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import { convertToTitleCase } from '../utils/utils'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'
import LicenceEventType from '../enumeration/licenceEventType'
import TimelineEvent from '../@types/TimelineEvent'
import TimelineEventType from '../enumeration/TimelineEventType'
import LicenceKind from '../enumeration/LicenceKind'

export default class TimelineService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  private async getReviewEvents(licence: Licence, user: User): Promise<TimelineEvent[]> {
    const conversationEventTypes = [LicenceEventType.HARD_STOP_REVIEWED_WITHOUT_VARIATION.valueOf()]
    const events = await this.licenceApiClient.matchLicenceEvents(
      `${licence.id}`,
      conversationEventTypes,
      'eventTime',
      'DESC',
      user
    )
    return events.map(
      e =>
        new TimelineEvent(
          TimelineEventType.REVIEWED_WITHOUT_VARIATION,
          'Licence reviewed without being varied',
          licence.statusCode,
          convertToTitleCase(`${e.forenames} ${e.surname}`),
          licence.id,
          e.eventTime
        )
    )
  }

  async getTimelineEvents(licence: Licence, user: User): Promise<TimelineEvent[]> {
    const licences: Licence[] = []
    let thisLicence: Licence = licence
    licences.push(thisLicence)

    // Get the trail of variations back to the original licence
    while (thisLicence.kind === 'VARIATION') {
      // eslint-disable-next-line no-await-in-loop
      thisLicence = await this.licenceApiClient.getLicenceById(thisLicence?.variationOf, user)
      if (thisLicence) {
        licences.push(thisLicence)
      }
    }

    return this.convertLicencesToTimelineEvents(licences, user)
  }

  public static getLicenceType = (sentenceDetail: CvlPrisoner): LicenceType => {
    const tused = sentenceDetail?.topupSupervisionExpiryDate
    const led = sentenceDetail?.licenceExpiryDate

    if (!led) {
      return LicenceType.PSS
    }

    if (!tused || moment(tused, 'YYYY-MM-DD') <= moment(led, 'YYYY-MM-DD')) {
      return LicenceType.AP
    }

    return LicenceType.AP_PSS
  }

  private async convertLicencesToTimelineEvents(licences: Licence[], user: User): Promise<TimelineEvent[]> {
    const hardstopLicence = licences.find(l => l.kind === LicenceKind.HARD_STOP)
    const reviewTimelineEvents = hardstopLicence ? await this.getReviewEvents(hardstopLicence, user) : []

    return licences
      .map(licence => TimelineService.getTimelineEvent(licence))
      .concat(reviewTimelineEvents)
      .sort((a, b) => b.getSortTime() - a.getSortTime())
  }

  private static getTimelineEvent(licence: Licence): TimelineEvent {
    const varyOf = licence.kind === 'VARIATION' ? licence.variationOf : undefined

    switch (licence.statusCode) {
      case LicenceStatus.VARIATION_IN_PROGRESS:
        return new TimelineEvent(
          TimelineEventType.VARIATION_IN_PROGRESS,
          'Variation in progress',
          licence.statusCode,
          licence.createdByFullName,
          licence.id,
          licence.dateLastUpdated
        )

      case LicenceStatus.VARIATION_SUBMITTED:
        return new TimelineEvent(
          TimelineEventType.SUBMITTED,
          'Variation submitted',
          licence.statusCode,
          licence.createdByFullName,
          licence.id,
          licence.dateLastUpdated
        )

      case LicenceStatus.VARIATION_REJECTED:
        return new TimelineEvent(
          TimelineEventType.REJECTED,
          'Variation rejected',
          licence.statusCode,
          licence.createdByFullName,
          licence.id,
          licence.dateLastUpdated
        )

      case LicenceStatus.VARIATION_APPROVED:
        return new TimelineEvent(
          TimelineEventType.VARIATION,
          'Licence varied',
          licence.statusCode,
          licence.createdByFullName,
          licence.id,
          licence.dateLastUpdated
        )

      case LicenceStatus.ACTIVE:
      case LicenceStatus.INACTIVE:
      default:
        return varyOf
          ? new TimelineEvent(
              TimelineEventType.VARIATION,
              'Licence varied',
              licence.statusCode,
              licence.createdByFullName,
              licence.id,
              licence.dateLastUpdated
            )
          : new TimelineEvent(
              TimelineEventType.CREATION,
              'Licence created',
              licence.statusCode,
              `${licence.createdByFullName}${licence.kind === LicenceKind.HARD_STOP ? `, ${licence.prisonDescription}` : ''}`,
              licence.id,
              licence.dateCreated
            )
    }
  }
}
