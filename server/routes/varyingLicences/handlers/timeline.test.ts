import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import TimelineRoutes from './timeline'
import LicenceStatus from '../../../enumeration/licenceStatus'
import TimelineEvent from '../../../@types/TimelineEvent'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Timeline', () => {
  const handler = new TimelineRoutes(licenceService)

  let req: Request
  let res: Response

  const commonRes = {
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  const commonUser = { username: 'joebloggs' }

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      query: {},
    } as unknown as Request
  })

  describe('GET', () => {
    it('should render a timeline view of an in progress variation', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
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

      licenceService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(licenceService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_IN_PROGRESS },
        { username: 'joebloggs' }
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToActions: {
          shouldShowVaryButton: false,
          shouldShowPrintToActivateButton: false,
          shouldShowEditAndDiscardButton: true,
        },
      })
    })

    it('should render a view of an approved approved', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_APPROVED,
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

      licenceService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(licenceService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_APPROVED },
        { username: 'joebloggs' }
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToActions: {
          shouldShowVaryButton: false,
          shouldShowPrintToActivateButton: true,
          shouldShowEditAndDiscardButton: false,
        },
      })
    })

    it('should render a view of a rejected variation', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_REJECTED,
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

      licenceService.getTimelineEvents.mockResolvedValue(timelineEvents)

      await handler.GET(req, res)

      expect(licenceService.getTimelineEvents).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_REJECTED },
        { username: 'joebloggs' }
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/timeline', {
        timelineEvents,
        callToActions: {
          shouldShowVaryButton: false,
          shouldShowPrintToActivateButton: false,
          shouldShowEditAndDiscardButton: true,
        },
      })
    })
  })

  describe('POST', () => {
    it('should activate a current approved variation and return to the timeline page', async () => {
      res = {
        ...commonRes,
        locals: {
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_APPROVED,
          },
          user: commonUser,
        },
      } as unknown as Response
      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith(1, LicenceStatus.ACTIVE, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/timeline')
    })
  })
})
