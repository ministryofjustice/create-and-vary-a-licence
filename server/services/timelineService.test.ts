import { User } from '../@types/CvlUserDetails'
import LicenceApiClient from '../data/licenceApiClient'
import LicenceStatus from '../enumeration/licenceStatus'
import { Licence } from '../@types/licenceApiClientTypes'
import TimelineEvent from '../@types/TimelineEvent'
import TimelineService from './timelineService'
import LicenceEventType from '../enumeration/licenceEventType'

jest.mock('../data/licenceApiClient')

describe('Timeline Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const timelineService = new TimelineService(licenceApiClient)

  const user = {
    username: 'joebloggs',
    displayName: 'Joe Bloggs',
    deliusStaffIdentifier: 2000,
    firstName: 'Joe',
    lastName: 'Bloggs',
    emailAddress: 'jbloggs@probation.gov.uk',
  } as User

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Get timeline events', () => {
    const originalLicence = {
      id: 1,
      kind: 'CRD',
      statusCode: LicenceStatus.ACTIVE,
      createdByFullName: 'Jackson Browne',
      dateLastUpdated: '10/11/2022 11:00:00',
      dateCreated: '10/11/2022 10:00:00',
    } as Licence

    const expectedEvents = [
      {
        eventType: 'CREATION',
        title: 'Licence created',
        statusCode: 'ACTIVE',
        createdBy: 'Jackson Browne',
        licenceId: 1,
        lastUpdate: '10/11/2022 10:00:00',
      },
    ] as unknown as TimelineEvent[]

    it('will return a list of timeline events for an approved variation', async () => {
      const licenceVariation = {
        id: 2,
        kind: 'VARIATION',
        statusCode: LicenceStatus.VARIATION_APPROVED,
        variationOf: 1,
        createdByFullName: 'James Brown',
        dateLastUpdated: '12/11/2022 10:45:00',
        isVariation: true,
      } as Licence

      const variationApproved = {
        eventType: 'VARIATION',
        title: 'Licence varied',
        statusCode: 'VARIATION_APPROVED',
        createdBy: 'James Brown',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
      }

      licenceApiClient.getLicenceById.mockResolvedValue(originalLicence)
      const timelineEvents = await timelineService.getTimelineEvents(licenceVariation, user)
      expect(timelineEvents).toEqual([variationApproved, ...expectedEvents])
      expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith(1, user)
    })

    it('will return a list of timeline events for a submitted variation', async () => {
      const licenceVariation = {
        id: 2,
        kind: 'VARIATION',
        statusCode: LicenceStatus.VARIATION_SUBMITTED,
        variationOf: 1,
        createdByFullName: 'James Brown',
        dateLastUpdated: '12/11/2022 10:45:00',
        isVariation: true,
      } as Licence

      const variationSubmitted = {
        eventType: 'SUBMITTED',
        title: 'Variation submitted',
        statusCode: 'VARIATION_SUBMITTED',
        createdBy: 'James Brown',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
      }

      licenceApiClient.getLicenceById.mockResolvedValue(originalLicence)
      const timelineEvents = await timelineService.getTimelineEvents(licenceVariation, user)
      expect(timelineEvents).toEqual([variationSubmitted, ...expectedEvents])
      expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith(1, user)
    })

    it('will return a list of timeline events for a rejected variation', async () => {
      const licenceVariation = {
        id: 2,
        kind: 'VARIATION',
        statusCode: LicenceStatus.VARIATION_REJECTED,
        variationOf: 1,
        createdByFullName: 'James Brown',
        dateLastUpdated: '12/11/2022 10:45:00',
        isVariation: true,
      } as Licence

      const variationRejected = {
        eventType: 'REJECTED',
        title: 'Variation rejected',
        statusCode: 'VARIATION_REJECTED',
        createdBy: 'James Brown',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
      }

      licenceApiClient.getLicenceById.mockResolvedValue(originalLicence)
      const timelineEvents = await timelineService.getTimelineEvents(licenceVariation, user)
      expect(timelineEvents).toEqual([variationRejected, ...expectedEvents])
      expect(licenceApiClient.getLicenceById).toHaveBeenCalledWith(1, user)
    })

    it('will return a list of timeline events for a reviewed standard licences', async () => {
      const standardLicence = {
        id: 2,
        kind: 'HARD_STOP',
        statusCode: LicenceStatus.ACTIVE,
        createdByFullName: 'JAMES BROWN',
        dateLastUpdated: '12/11/2022 10:00:00',
        prisonDescription: 'Moorland (hmp)',
        dateCreated: '10/11/2022 11:00:00',
      } as Licence

      licenceApiClient.matchLicenceEvents.mockResolvedValue([
        {
          licenceId: 2,
          eventType: LicenceEventType.HARD_STOP_REVIEWED_WITHOUT_VARIATION,
          username: 'TIM_USER',
          forenames: 'Tim',
          surname: 'Smith',
          eventTime: '12/11/2022 12:30:00',
          eventDescription: `Licence reviewed without being varied for Jack Walker`,
        },
      ])

      const expected = [
        {
          createdBy: 'Tim Smith',
          eventType: 'REVIEWED_WITHOUT_VARIATION',
          lastUpdate: '12/11/2022 12:30:00',
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence reviewed without being varied',
        },
        {
          createdBy: 'James Brown, Moorland (HMP)',
          eventType: 'CREATION',
          lastUpdate: '10/11/2022 11:00:00',
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence created',
        },
      ]

      const timelineEvents = await timelineService.getTimelineEvents(standardLicence, user)
      expect(timelineEvents).toEqual(expected)
      expect(licenceApiClient.matchLicenceEvents).toHaveBeenCalledWith(
        '2',
        ['HARD_STOP_REVIEWED_WITHOUT_VARIATION'],
        'eventTime',
        'DESC',
        user,
      )
    })

    it('will handle missing dates', async () => {
      const standardLicence = {
        id: 2,
        kind: 'HARD_STOP',
        statusCode: LicenceStatus.ACTIVE,
        createdByFullName: 'JAMES BROWN',
        dateLastUpdated: '12/11/2022 10:00:00',
        prisonDescription: 'Moorland (hmp)',
        dateCreated: undefined,
      } as Licence

      licenceApiClient.matchLicenceEvents.mockResolvedValue([
        {
          licenceId: 2,
          eventType: LicenceEventType.HARD_STOP_REVIEWED_WITHOUT_VARIATION,
          username: 'TIM_USER',
          forenames: 'Tim',
          surname: 'Smith',
          eventTime: undefined,
          eventDescription: `Licence reviewed without being varied for Jack Walker`,
        },
      ])

      const expected = [
        {
          createdBy: 'James Brown, Moorland (HMP)',
          eventType: 'CREATION',
          lastUpdate: undefined as string,
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence created',
        },
        {
          createdBy: 'Tim Smith',
          eventType: 'REVIEWED_WITHOUT_VARIATION',
          lastUpdate: undefined as string,
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence reviewed without being varied',
        },
      ]

      const timelineEvents = await timelineService.getTimelineEvents(standardLicence, user)
      expect(timelineEvents).toEqual(expected)
      expect(licenceApiClient.matchLicenceEvents).toHaveBeenCalledWith(
        '2',
        ['HARD_STOP_REVIEWED_WITHOUT_VARIATION'],
        'eventTime',
        'DESC',
        user,
      )
    })
  })
})
