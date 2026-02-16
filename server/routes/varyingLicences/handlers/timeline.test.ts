import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import TimelineRoutes from './timeline'
import LicenceStatus from '../../../enumeration/licenceStatus'
import TimelineEvent from '../../../@types/TimelineEvent'
import TimelineService from '../../../services/timelineService'
import LicenceKind from '../../../enumeration/LicenceKind'
import config from '../../../config'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/timelineService')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const timelineService = new TimelineService(null) as jest.Mocked<TimelineService>

describe('Route Handlers - Timeline', () => {
  const handler = new TimelineRoutes(licenceService, timelineService)

  let req: Request
  let res: Response

  const commonRes = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  const commonUser = { username: 'joebloggs' }

  const existingConfig = config

  beforeEach(() => {
    config.hdcEnabled = true
    req = {
      params: {
        licenceId: 1,
      },
      query: {},
      flash: jest.fn(),
    } as unknown as Request
    jest.resetAllMocks()
  })

  afterEach(() => {
    config.hdcEnabled = existingConfig.hdcEnabled
    config.timeServed = existingConfig.timeServed
  })

  describe('GET', () => {
    it('should render a timeline view of an in progress variation', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
            isReviewNeeded: false,
          },
          user: commonUser,
        },
      } as unknown as Response

      const timelineEvents = [
        {
          eventType: 'CREATION',
          title: 'Licence created',
          statusCode: 'ACTIVE',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
        {
          eventType: 'VARIATION',
          title: 'Variation in progress',
          statusCode: 'VARIATION_IN_PROGRESS',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
      ] as unknown as TimelineEvent[]

      timelineService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(timelineService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_IN_PROGRESS, isReviewNeeded: false },
        { username: 'joebloggs' },
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToAction: 'EDIT',
        showTimeServedImproveServiceBanner: false,
      })
    })

    it('should render a view of an approved variation', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_APPROVED,
            isReviewNeeded: false,
          },
          user: commonUser,
        },
      } as unknown as Response

      const timelineEvents = [
        {
          eventType: 'CREATION',
          title: 'Licence created',
          statusCode: 'ACTIVE',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
        {
          eventType: 'VARIATION',
          title: 'Licence varied',
          statusCode: 'VARIATION_APPROVED',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
      ] as unknown as TimelineEvent[]

      timelineService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(timelineService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_APPROVED, isReviewNeeded: false },
        { username: 'joebloggs' },
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToAction: 'PRINT_TO_ACTIVATE',
        showTimeServedImproveServiceBanner: false,
      })
    })

    it('should render a view of a rejected variation', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_REJECTED,
            isReviewNeeded: false,
          },
          user: commonUser,
        },
      } as unknown as Response

      const timelineEvents = [
        {
          eventType: 'CREATION',
          title: 'Licence created',
          statusCode: 'ACTIVE',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
        {
          eventType: 'VARIATION',
          title: 'Variation in progress',
          statusCode: 'VARIATION_REJECTED',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
      ] as unknown as TimelineEvent[]

      timelineService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(timelineService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_REJECTED, isReviewNeeded: false },
        { username: 'joebloggs' },
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToAction: 'EDIT',
        showTimeServedImproveServiceBanner: false,
      })
    })

    it('should render a view of a review needed licence', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.REVIEW_NEEDED,
            isReviewNeeded: true,
          },
          user: commonUser,
        },
      } as unknown as Response

      const timelineEvents = [
        {
          eventType: 'CREATION',
          title: 'Licence created',
          statusCode: 'ACTIVE',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
      ] as unknown as TimelineEvent[]

      timelineService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(timelineService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.REVIEW_NEEDED, isReviewNeeded: true },
        { username: 'joebloggs' },
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToAction: 'REVIEW',
        showTimeServedImproveServiceBanner: false,
      })
    })

    it('should render view or vary', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.ACTIVE,
            isReviewNeeded: false,
            kind: LicenceKind.CRD,
          },
          user: commonUser,
        },
      } as unknown as Response

      const timelineEvents = [
        {
          eventType: 'CREATION',
          title: 'Licence created',
          statusCode: 'ACTIVE',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
      ] as unknown as TimelineEvent[]

      timelineService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(timelineService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.ACTIVE, isReviewNeeded: false, kind: LicenceKind.CRD },
        { username: 'joebloggs' },
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToAction: 'VIEW_OR_VARY',
        showTimeServedImproveServiceBanner: false,
      })
    })

    it('should render view or vary call to action for HDC licences when hdcEnabled is true', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            kind: LicenceKind.HDC,
            statusCode: LicenceStatus.ACTIVE,
            isReviewNeeded: false,
          },
          user: commonUser,
        },
      } as unknown as Response

      const timelineEvents = [
        {
          eventType: 'CREATION',
          title: 'Licence created',
          statusCode: 'ACTIVE',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
      ] as unknown as TimelineEvent[]

      timelineService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(timelineService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.ACTIVE, isReviewNeeded: false, kind: LicenceKind.HDC },
        { username: 'joebloggs' },
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToAction: 'VIEW_OR_VARY',
        showTimeServedImproveServiceBanner: false,
      })
    })

    it('should render view call to action for HDC licences when hdcEnabled is false', async () => {
      config.hdcEnabled = false
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            kind: LicenceKind.HDC,
            statusCode: LicenceStatus.ACTIVE,
            isReviewNeeded: false,
          },
          user: commonUser,
        },
      } as unknown as Response

      const timelineEvents = [
        {
          eventType: 'CREATION',
          title: 'Licence created',
          statusCode: 'ACTIVE',
          createdBy: 'X Y',
          licenceId: 1,
          lastUpdate: '12/11/2022 10:04:00',
        },
      ] as unknown as TimelineEvent[]

      timelineService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(timelineService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.ACTIVE, isReviewNeeded: false, kind: LicenceKind.HDC },
        { username: 'joebloggs' },
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToAction: 'VIEW',
        showTimeServedImproveServiceBanner: false,
      })
    })

    it('should show the time served improve service banner when the flash is set', async () => {
      config.timeServed.enabled = true
      config.timeServed.prisons = ['MDI', 'LEI']
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            kind: LicenceKind.TIME_SERVED,
            prisonCode: 'MDI',
            statusCode: LicenceStatus.ACTIVE,
            isReviewNeeded: false,
          },
          user: commonUser,
        },
      } as unknown as Response
      ;(req.flash as jest.Mock).mockReturnValue(['true'])
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/vary/timeline',
        expect.objectContaining({
          showTimeServedImproveServiceBanner: true,
        }),
      )
    })
  })

  describe('POST', () => {
    it('should activate a current approved variation and return to the timeline page', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 2,
            kind: 'VARIATION',
            statusCode: LicenceStatus.VARIATION_APPROVED,
            variationOf: 1,
            isVariation: true,
          },
          user: commonUser,
        },
      } as unknown as Response

      await handler.POST(req, res)

      expect(licenceService.activateVariation).toHaveBeenCalledWith(2, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/timeline')
    })
  })
})
