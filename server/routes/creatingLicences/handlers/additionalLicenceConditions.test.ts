import { Request, Response } from 'express'

import AdditionalLicenceConditionsRoutes from './additionalLicenceConditions'
import LicenceService from '../../../services/licenceService'
import * as conditionsProvider from '../../../utils/conditionsProvider'
import LicenceType from '../../../enumeration/licenceType'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

jest
  .spyOn(conditionsProvider, 'getGroupedAdditionalConditions')
  .mockReturnValue([{ groupName: 'group1', conditions: [{ code: 'condition1' }] }])

describe('Route Handlers - Create Licence - Additional Licence Conditions', () => {
  const handler = new AdditionalLicenceConditionsRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      query: {},
      body: {},
      user: {
        username: 'joebloggs',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should throw error if licence type does not support additional conditions', async () => {
      res.locals = {
        licence: { typeCode: 'PSS' },
      }

      await expect(() => handler.GET(req, res)).rejects.toThrow(
        'Additional condition cannot be added to this type of licence'
      )
    })

    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalLicenceConditions', {
        additionalConditions: [
          {
            groupName: 'group1',
            conditions: [{ code: 'condition1' }],
          },
        ],
      })
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditions = jest.fn()
    })

    it('should call licence service to update the list of additional conditions', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditions).toHaveBeenCalledWith(1, LicenceType.AP, {}, 'joebloggs')
    })

    it('should redirect to the callback function', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true'
      )
    })
  })
})
