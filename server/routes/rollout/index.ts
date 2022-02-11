import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import RolloutRoutes from './handlers/rollout'

export default function Index(): Router {
  const router = Router()
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const rolloutHandler = new RolloutRoutes()
  get('/rollout-status', rolloutHandler.GET)
  return router
}
