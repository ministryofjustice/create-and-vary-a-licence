import type { Licence } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import { convertToTitleCase, isVariation } from '../utils/utils'
import LicenceStatus from '../enumeration/licenceStatus'
import { User } from '../@types/CvlUserDetails'
import LicenceEventType from '../enumeration/licenceEventType'
import TimelineEvent from '../@types/TimelineEvent'
import TimelineEventType from '../enumeration/TimelineEventType'
import LicenceKind from '../enumeration/LicenceKind'

export default class TimelineService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  private async getReviewEvents(licence: Licence, user: User): Promise<TimelineEvent[]> {
    const conversationEventTypes = [LicenceEventType.REVIEWED_WITHOUT_VARIATION.valueOf()]
    const events = await this.licenceApiClient.matchLicenceEvents(
      `${licence.id}`,
      conversationEventTypes,
      'eventTime',
      'DESC',
      user,
    )
    return events.map(
      e =>
        new TimelineEvent(
          TimelineEventType.REVIEWED_WITHOUT_VARIATION,
          'Licence reviewed without being varied',
          licence.statusCode,
          convertToTitleCase(`${e.forenames} ${e.surname}`),
          licence.id,
          e.eventTime,
          e.eventTime,
        ),
    )
  }

  async getTimelineEvents(licence: Licence, user: User): Promise<TimelineEvent[]> {
    const licences: Licence[] = []
    let thisLicence: Licence = licence
    licences.push(thisLicence)

    // Get the trail of variations back to the original licence
    while (isVariation(thisLicence)) {
      // eslint-disable-next-line no-await-in-loop
      thisLicence = await this.licenceApiClient.getLicenceById(thisLicence?.variationOf, user)
      if (thisLicence) {
        licences.push(thisLicence)
      }
    }

    return this.convertLicencesToTimelineEvents(licences, user)
  }

  private async convertLicencesToTimelineEvents(licences: Licence[], user: User): Promise<TimelineEvent[]> {
    const prisonCreatedLicence = licences.find(
      l => l.kind === LicenceKind.HARD_STOP || l.kind === LicenceKind.TIME_SERVED,
    )
    const reviewTimelineEvents = prisonCreatedLicence ? await this.getReviewEvents(prisonCreatedLicence, user) : []

    return licences
      .map(licence => TimelineService.getTimelineEvent(licence))
      .concat(reviewTimelineEvents)
      .sort((a, b) => b.getSortTime() - a.getSortTime())
  }

  private static getTimelineEvent(licence: Licence): TimelineEvent {
    const varyOf = isVariation(licence) ? licence.variationOf : undefined
    const creator = convertToTitleCase(licence.createdByFullName)
    switch (licence.statusCode) {
      case LicenceStatus.VARIATION_IN_PROGRESS:
        return new TimelineEvent(
          TimelineEventType.VARIATION_IN_PROGRESS,
          'Variation in progress',
          licence.statusCode,
          creator,
          licence.id,
          licence.dateLastUpdated,
          licence.dateCreated,
        )

      case LicenceStatus.VARIATION_SUBMITTED:
        return new TimelineEvent(
          TimelineEventType.SUBMITTED,
          'Variation submitted',
          licence.statusCode,
          creator,
          licence.id,
          licence.dateLastUpdated,
          licence.dateCreated,
        )

      case LicenceStatus.VARIATION_REJECTED:
        return new TimelineEvent(
          TimelineEventType.REJECTED,
          'Variation rejected',
          licence.statusCode,
          creator,
          licence.id,
          licence.dateLastUpdated,
          licence.dateCreated,
        )

      case LicenceStatus.VARIATION_APPROVED:
        return new TimelineEvent(
          TimelineEventType.VARIATION,
          'Licence varied',
          licence.statusCode,
          creator,
          licence.id,
          licence.dateLastUpdated,
          licence.dateCreated,
        )

      case LicenceStatus.ACTIVE:
      case LicenceStatus.INACTIVE:
      default: {
        const prisonName = convertToTitleCase(licence.prisonDescription).replace('hmp', 'HMP').replace('yoi', 'YOI')
        return varyOf
          ? new TimelineEvent(
              TimelineEventType.VARIATION,
              'Licence varied',
              licence.statusCode,
              creator,
              licence.id,
              licence.dateLastUpdated,
              licence.dateCreated,
            )
          : new TimelineEvent(
              TimelineEventType.CREATION,
              'Licence created',
              licence.statusCode,
              `${creator}${licence.kind === LicenceKind.HARD_STOP ? `, ${prisonName}` : ''}`,
              licence.id,
              licence.dateCreated,
              licence.dateCreated,
            )
      }
    }
  }
}
