/* eslint no-param-reassign: "off" */
import { Express } from 'express'

export default (app: Express, phaseName: string) => {
  app.locals.phaseName = phaseName
  app.locals.phaseNameColour = phaseName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
}
