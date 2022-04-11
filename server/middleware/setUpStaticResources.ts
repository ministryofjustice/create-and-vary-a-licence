import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../config'

export default function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }
  ;[
    '/assets',
    '/assets/stylesheets',
    '/assets/images',
    '/assets/js',
    '/node_modules/govuk-frontend/govuk/assets',
    '/node_modules/govuk-frontend',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
  ].forEach(dir => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/govuk_frontend_toolkit/images'].forEach(dir => {
    router.use('/assets/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/jquery/dist/jquery.min.js'].forEach(dir => {
    router.use('/assets/js/jquery.min.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/jquery-ui-dist/jquery-ui.min.js'].forEach(dir => {
    router.use('/assets/js/jquery-ui.min.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/jquery-ui-dist/jquery-ui.min.css'].forEach(dir => {
    router.use('/assets/stylesheets/jquery-ui.min.css', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  router.use('/favicon.ico', express.static(path.join(process.cwd(), '/assets/images/favicon.ico'), cacheControl))

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
