import { NextFunction, Request, Response } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import DprService from '../../../services/dprService'
import DprReportsRoutes from './dprReports'

const dprService = new DprService(null) as jest.Mocked<DprService>
jest.mock('../../../services/dprService')

describe('Route Handlers - DPR Reports', () => {
  const handler = new DprReportsRoutes(dprService)
  const dprHandler = jest.fn()
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {
      params: {
        id: 'id-1',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        reportDefinitions: [
          {
            id: 'id-1',
            name: 'name-1',
            description: 'description-1',
            variants: [
              {
                id: 'id-1',
                name: 'report-1',
                descripion: 'description-1',
              },
            ],
            authorised: true,
          },
        ],
        user: {
          token: 'token',
          username: 'joebloggs',
        },
      },
    } as unknown as Response
    next = jest.fn() as NextFunction
  })

  describe('GET', () => {
    it('Should call createReportListRequestHandler and return the handler successfully', async () => {
      jest.spyOn(ReportListUtils, 'createReportListRequestHandler').mockReturnValue(dprHandler)
      await handler.GET(req, res, next)
      expect(ReportListUtils.createReportListRequestHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          definitionName: 'id-1',
          layoutTemplate: 'partials/dprReport.njk',
          title: 'CVL Reports',
          variantName: 'id-1',
        }),
      )
      expect(dprHandler).toHaveBeenCalledWith(req, res, next)
    })
  })
})
