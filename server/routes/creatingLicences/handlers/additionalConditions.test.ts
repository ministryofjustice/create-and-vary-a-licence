import { Request, Response } from 'express'

import AdditionalConditionsRoutes from './additionalConditions'
import * as conditionsProvider from '../../../utils/conditionsProvider'

jest
  .spyOn(conditionsProvider, 'getGroupedAdditionalConditions')
  .mockReturnValue([{ groupName: 'group1', conditions: [{ id: 'condition1' }] }])

describe('Route Handlers - Create Licence - Additional Conditions', () => {
  const handler = new AdditionalConditionsRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalConditions', {
        offender: {
          name: 'Adam Balasaravika',
        },
        additionalConditions: [
          {
            groupName: 'group1',
            conditions: [{ id: 'condition1' }],
          },
        ],
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the bespoke conditions question page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions-question')
    })
  })
})
