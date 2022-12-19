import session from 'express-session'
import connectRedis from 'connect-redis'
import addRequestId from 'express-request-id'
import express, { Router } from 'express'
import { createRedisClient } from '../data/redisClient'
import config from '../config'
import logger from '../../logger'

const RedisStore = connectRedis(session)

export default function setUpWebSession(): Router {
  const client = createRedisClient({ legacyMode: true })
  client.connect().catch((err: Error) => logger.error(`Error connecting to Redis`, err))

  const router = express.Router()
  router.use(
    session({
      store: new RedisStore({ client }),
      cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    })
  )

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  router.use(addRequestId())

  return router
}
