import { NextFunction, Request, Response } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import DprService from '../../../services/dprService'
import DprReportsRoutes from './dprReports'
import { DprReportDefinition } from '../../../@types/dprReportingTypes'
import { getSystemToken } from '../../../data/systemToken'

jest.mock('../../../services/dprService')
jest.mock('../../../data/systemToken', () => {
  return { getSystemToken: jest.fn().mockResolvedValue({ token: 'token' }) }
})

const dprService = new DprService(null) as jest.Mocked<DprService>

describe('Route Handlers - DPR Reports', () => {
  const handler = new DprReportsRoutes(dprService)
  const dprHandler = jest.fn()
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {
      user: {
        username: 'joebloggs',
      },
      params: {
        id: '1',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
    next = jest.fn() as NextFunction

    dprService.getDefinitions.mockResolvedValue([
      {
        id: '1',
        name: 'definition',
        description: 'This is a definition',
        variants: [
          {
            id: '1',
            name: 'report name 1',
            description: 'report description 1',
          },
        ],
        authorised: true,
      },
    ] as unknown as DprReportDefinition[])
  })

  describe('GET', () => {
    it('Should call createReportListRequestHandler and return the handler successfully', async () => {
      jest.spyOn(ReportListUtils, 'createReportListRequestHandler').mockReturnValue(dprHandler)
      await handler.GET(req, res, next)
      expect(ReportListUtils.createReportListRequestHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          definitionName: '1',
          layoutTemplate: 'partials/dprReport.njk',
          title: 'CVL Reports',
          variantName: '1',
        }),
      )
      expect(dprHandler).toHaveBeenCalledWith(req, res, next)
      expect(getSystemToken).toHaveBeenCalledWith('joebloggs')
      expect(dprService.getDefinitions).toHaveBeenCalledWith({ token: 'token', username: 'joebloggs' })
    })
  })
})
