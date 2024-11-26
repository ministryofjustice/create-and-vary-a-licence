import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../config'

export default function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration }
  ;[
    '/assets',
    '/assets/stylesheets',
    '/assets/images',
    '/assets/js',
    '/node_modules/govuk-frontend/dist/govuk/assets',
    '/node_modules/govuk-frontend/dist',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
  ].forEach(dir => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  router.use(
    '/assets/images/icons',
    express.static(path.join(process.cwd(), '/node_modules/govuk_frontend_toolkit/images'), cacheControl),
  )
  router.use(
    '/assets/js/jquery.min.js',
    express.static(path.join(process.cwd(), '/node_modules/jquery/dist/jquery.min.js'), cacheControl),
  )
  router.use(
    '/assets/js/jquery-ui.min.js',
    express.static(path.join(process.cwd(), '/node_modules/jquery-ui-dist/jquery-ui.min.js'), cacheControl),
  )
  router.use(
    '/assets/stylesheets/jquery-ui.min.css',
    express.static(path.join(process.cwd(), '/node_modules/jquery-ui-dist/jquery-ui.min.css'), cacheControl),
  )
  router.use(
    '/assets/dpr',
    express.static(
      path.join(process.cwd(), '/node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/assets'),
      cacheControl,
    ),
  )
  router.use(
    '/assets/ext/chart.js',
    express.static(path.join(process.cwd(), '/node_modules/chart.js/dist/chart.umd.js'), cacheControl),
  )
  router.use(
    '/assets/ext/chart.umd.js.map',
    express.static(path.join(process.cwd(), '/node_modules/chart.js/dist/chart.umd.js.map'), cacheControl),
  )
  router.use(
    '/assets/ext/chartjs-datalabels.js',
    express.static(
      path.join(process.cwd(), '/node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js'),
      cacheControl,
    ),
  )
  router.use(
    '/assets/ext/day.js',
    express.static(path.join(process.cwd(), '/node_modules/dayjs/dayjs.min.js'), cacheControl),
  )
  router.use(
    '/assets/ext/dayjs/plugin/customParseFormat.js',
    express.static(path.join(process.cwd(), '/node_modules/dayjs/plugin/customParseFormat.js'), cacheControl),
  )
  router.use('/favicon.ico', express.static(path.join(process.cwd(), '/assets/images/favicon.ico'), cacheControl))

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
