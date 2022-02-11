import { Request, Response } from 'express'
import RolloutRoutes from './rollout'
import config from '../../../config'

describe('Route Handlers - Rollout', () => {
  const handler = new RolloutRoutes()
  let req: Request

  describe('GET', () => {
    it('Prison user outside rollout', async () => {
      const res = {
        locals: {
          user: {
            username: 'TEST',
            authSource: 'nomis',
          },
        },
        render: jest.fn(),
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/rollout-status', {
        authSource: 'nomis',
        homeUrl: config.apis.hmppsAuth.url,
      })
    })

    it('Probation user outside rollout', async () => {
      const res = {
        locals: {
          user: {
            username: 'TEST',
            authSource: 'delius',
          },
        },
        render: jest.fn(),
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/rollout-status', {
        authSource: 'delius',
        homeUrl: config.apis.hmppsAuth.url,
      })
    })
  })
})
