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
      createdByFullName: 'John Smith',
      dateLastUpdated: '10/11/2022 11:00:00',
      dateCreated: '10/11/2022 10:00:00',
    } as Licence

    const expectedEvents = [
      {
        eventType: 'CREATION',
        title: 'Licence created',
        statusCode: 'ACTIVE',
        createdBy: 'John Smith',
        licenceId: 1,
        lastUpdate: '10/11/2022 10:00:00',
        createdAt: '10/11/2022 10:00:00',
      },
    ] as unknown as TimelineEvent[]

    it('will return a list of timeline events for an approved variation', async () => {
      const licenceVariation = {
        id: 2,
        kind: 'VARIATION',
        statusCode: LicenceStatus.VARIATION_APPROVED,
        variationOf: 1,
        createdByFullName: 'Other User',
        dateLastUpdated: '12/11/2022 10:45:00',
        dateCreated: '12/11/2022 10:00:00',
        isVariation: true,
      } as Licence

      const variationApproved = {
        eventType: 'VARIATION',
        title: 'Licence varied',
        statusCode: 'VARIATION_APPROVED',
        createdBy: 'Other User',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
        createdAt: '12/11/2022 10:00:00',
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
        createdByFullName: 'Other User',
        dateLastUpdated: '12/11/2022 10:45:00',
        dateCreated: '12/11/2022 10:00:00',
        isVariation: true,
      } as Licence

      const variationSubmitted = {
        eventType: 'SUBMITTED',
        title: 'Variation submitted',
        statusCode: 'VARIATION_SUBMITTED',
        createdBy: 'Other User',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
        createdAt: '12/11/2022 10:00:00',
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
        createdByFullName: 'Other User',
        dateLastUpdated: '12/11/2022 10:45:00',
        dateCreated: '12/11/2022 10:00:00',
        isVariation: true,
      } as Licence

      const variationRejected = {
        eventType: 'REJECTED',
        title: 'Variation rejected',
        statusCode: 'VARIATION_REJECTED',
        createdBy: 'Other User',
        licenceId: 2,
        lastUpdate: '12/11/2022 10:45:00',
        createdAt: '12/11/2022 10:00:00',
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
        createdByFullName: 'OTHER USER',
        dateLastUpdated: '12/11/2022 10:00:00',
        prisonDescription: 'Moorland (hmp)',
        dateCreated: '11/11/2022 11:00:00',
      } as Licence

      licenceApiClient.matchLicenceEvents.mockResolvedValue([
        {
          id: 1,
          licenceId: 2,
          eventType: LicenceEventType.REVIEWED_WITHOUT_VARIATION,
          username: 'TEST_USER',
          forenames: 'Test',
          surname: 'User',
          eventTime: '12/11/2022 12:30:00',
          eventDescription: `Licence reviewed without being varied for Jack Walker`,
        },
      ])

      const expected = [
        {
          createdBy: 'Test User',
          eventType: 'REVIEWED_WITHOUT_VARIATION',
          lastUpdate: '12/11/2022 12:30:00',
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence reviewed without being varied',
          createdAt: '12/11/2022 12:30:00',
        },
        {
          createdBy: 'Other User, Moorland (HMP)',
          eventType: 'CREATION',
          lastUpdate: '11/11/2022 11:00:00',
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence created',
          createdAt: '11/11/2022 11:00:00',
        },
      ]

      const timelineEvents = await timelineService.getTimelineEvents(standardLicence, user)
      expect(timelineEvents).toEqual(expected)
      expect(licenceApiClient.matchLicenceEvents).toHaveBeenCalledWith(
        '2',
        ['REVIEWED_WITHOUT_VARIATION'],
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
        createdByFullName: 'OTHER USER',
        dateLastUpdated: '12/11/2022 10:00:00',
        prisonDescription: 'Moorland (hmp)',
        dateCreated: '10/11/2022 11:00:00',
      } as Licence

      licenceApiClient.matchLicenceEvents.mockResolvedValue([
        {
          id: 1,
          licenceId: 2,
          eventType: LicenceEventType.REVIEWED_WITHOUT_VARIATION,
          username: 'TEST_USER',
          forenames: 'Test',
          surname: 'User',
          eventTime: undefined,
          eventDescription: `Licence reviewed without being varied for Jack Walker`,
        },
      ])

      const expected = [
        {
          createdBy: 'Other User, Moorland (HMP)',
          eventType: 'CREATION',
          lastUpdate: '10/11/2022 11:00:00',
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence created',
          createdAt: '10/11/2022 11:00:00',
        },
        {
          createdBy: 'Test User',
          eventType: 'REVIEWED_WITHOUT_VARIATION',
          lastUpdate: undefined as string,
          licenceId: 2,
          statusCode: 'ACTIVE',
          title: 'Licence reviewed without being varied',
          createdAt: undefined as string,
        },
      ]

      const timelineEvents = await timelineService.getTimelineEvents(standardLicence, user)
      expect(timelineEvents).toEqual(expected)
      expect(licenceApiClient.matchLicenceEvents).toHaveBeenCalledWith(
        '2',
        ['REVIEWED_WITHOUT_VARIATION'],
        'eventTime',
        'DESC',
        user,
      )
    })

    it('will handle Time served dates reviewed without variation', async () => {
      const standardLicence = {
        id: 2,
        kind: 'TIME_SERVED',
        statusCode: LicenceStatus.ACTIVE,
        createdByFullName: 'OTHER USER',
        dateLastUpdated: '12/11/2022 10:00:00',
        prisonDescription: 'Moorland (hmp)',
        dateCreated: '10/11/2022 11:00:00',
      } as Licence

      licenceApiClient.matchLicenceEvents.mockResolvedValue([
        {
          id: 1,
          licenceId: 2,
          eventType: LicenceEventType.REVIEWED_WITHOUT_VARIATION,
          username: 'TEST_USER',
          forenames: 'Test',
          surname: 'User',
          eventTime: undefined,
          eventDescription: `Licence reviewed without being varied for Jack Walker`,
        },
      ])

      const timelineEvents = await timelineService.getTimelineEvents(standardLicence, user)

      expect(timelineEvents).toEqual(
        expect.arrayContaining([
          {
            createdAt: undefined,
            createdBy: 'Test User',
            eventType: 'REVIEWED_WITHOUT_VARIATION',
            lastUpdate: undefined,
            licenceId: 2,
            statusCode: 'ACTIVE',
            title: 'Licence reviewed without being varied',
          },
        ]),
      )
    })
  })
})
