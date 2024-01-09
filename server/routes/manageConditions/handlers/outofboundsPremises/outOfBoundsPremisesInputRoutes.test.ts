import { Request, Response } from 'express'

import OutOfBoundsPremisesInputRoutes from './outOfBoundsPremisesInputRoutes'
import LicenceService from '../../../../services/licenceService'
import type { Licence } from '../../../../@types/licenceApiClientTypes'

jest.mock('../../../../services/licenceService')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - file upload input routes', () => {
  const handler = new OutOfBoundsPremisesInputRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        conditionId: '1',
      },
      query: {},
      body: { nameOfPremises: 'name of premises' },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          additionalLicenceConditions: [],
          version: 'version',
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditionData = jest.fn()
      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      } as Licence
    })

    it('should call licence service to update the additional condition data', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        { code: 'code1', id: 1 },
        { nameOfPremises: 'name of premises' },
        { username: 'joebloggs' }
      )
    })

    it('should redirect to the list view', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/condition/code1/outofbounds-premises'
      )
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/condition/code1/outofbounds-premises?fromReview=true'
      )
    })
  })

  describe('DELETE', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditions = jest.fn()
      licenceService.deleteAdditionalCondition = jest.fn()
      res.locals.licence = {
        id: 1,
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
            expandedText: 'expanded text',
          },
          {
            id: 2,
            code: 'code2',
            expandedText: 'more expanded text',
          },
        ],
      } as Licence
    })

    it('should call licence service to update the additional conditions with the condition removed', async () => {
      await handler.DELETE(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledWith(1, 1, { username: 'joebloggs' })
    })

    it('should redirect to the area list view', async () => {
      await handler.DELETE(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/condition/code1/outofbounds-premises'
      )
    })
  })
})
