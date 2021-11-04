/* eslint-disable no-param-reassign */
import nunjucks, { Environment } from 'nunjucks'
import express from 'express'
import path from 'path'
import { FieldValidationError } from '../middleware/validationMiddleware'
import config from '../config'
import { jsonDtTo12HourTime, jsonDtToDate, jsonDtToDateWithDay } from './utils'
import { AdditionalCondition, AdditionalConditionData } from '../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from './conditionsProvider'
import SimpleTime from '../routes/creatingLicences/types/time'
import SimpleDate from '../routes/creatingLicences/types/date'
import Address from '../routes/creatingLicences/types/address'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Create and vary a licence'

  // Set the values for the phase banner and exit survey links from config
  app.locals.phaseBannerLink = config.phaseBannerLink
  app.locals.exitSurveyLink = config.exitSurveyLink

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  registerNunjucks(app)
}

export function registerNunjucks(app?: express.Express): Environment {
  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })

  njkEnv.addFilter('concatValues', (object?: Record<string, unknown>) => {
    if (!object) {
      return null
    }
    return Object.values(object).join(', ')
  })

  njkEnv.addFilter('errorSummaryList', (array = []) => {
    return array.map((error: FieldValidationError) => ({
      text: error.message,
      href: `#${error.field}`,
    }))
  })

  njkEnv.addFilter('findError', (array: FieldValidationError[] = [], formFieldId: string) => {
    const item = array.find(error => error.field === formFieldId)
    if (item) {
      return {
        text: item.message,
      }
    }
    return null
  })

  njkEnv.addFilter('fillFormResponse', (defaultValue: unknown, overrideValue: unknown) => {
    if (overrideValue !== undefined) {
      return overrideValue
    }
    return defaultValue
  })

  njkEnv.addFilter('radioButtonChecked', (conditionId: string, additionalConditions: Record<string, unknown>[]) => {
    return additionalConditions?.find(c => c.code === conditionId) !== undefined
  })

  njkEnv.addFilter(
    'additionalConditionChecked',
    (conditionId: string, additionalConditions: Record<string, unknown>[]) => {
      return additionalConditions?.find(c => c.code === conditionId) !== undefined
    }
  )

  njkEnv.addFilter(
    'additionalConditionDataContainsValue',
    (additionalConditionData: AdditionalConditionData[], fieldName: string, value: string) => {
      return additionalConditionData.find(data => data.field === fieldName && data.value === value) !== undefined
    }
  )

  njkEnv.addFilter(
    'getAdditionalConditionDataValue',
    (additionalConditionData: AdditionalConditionData[], fieldName: string) => {
      return additionalConditionData.find(data => data.field === fieldName)?.value
    }
  )

  njkEnv.addFilter(
    'getAdditionalConditionSimpleTimeValue',
    (additionalConditionData: AdditionalConditionData[], fieldName: string) => {
      const object = {}
      object[fieldName] = SimpleTime.fromString(additionalConditionData.find(data => data.field === fieldName)?.value)
      return object
    }
  )

  njkEnv.addFilter(
    'getAdditionalConditionSimpleDateValue',
    (additionalConditionData: AdditionalConditionData[], fieldName: string) => {
      const object = {}
      object[fieldName] = SimpleDate.fromString(additionalConditionData.find(data => data.field === fieldName)?.value)
      return object
    }
  )

  njkEnv.addFilter(
    'getAdditionalConditionAddressValue',
    (additionalConditionData: AdditionalConditionData[], fieldName: string, property: string) => {
      const object = Address.fromString(additionalConditionData.find(data => data.field === fieldName)?.value)
      return object ? object[property] : undefined
    }
  )

  njkEnv.addFilter('checkConditionRequiresInput', (additionalCondition: AdditionalCondition) => {
    return getAdditionalConditionByCode(additionalCondition.code).requiresInput
  })

  njkEnv.addFilter('datetimeToDate', (dt: string) => {
    return jsonDtToDate(dt)
  })

  njkEnv.addFilter('datetimeToDateWithDay', (dt: string) => {
    return jsonDtToDateWithDay(dt)
  })

  njkEnv.addFilter('datetimeTo12HourTime', (dt: string) => {
    return jsonDtTo12HourTime(dt)
  })

  njkEnv.addFilter('formatAddress', (address?: string) => {
    return address
      ? address
          .split(', ')
          .filter(line => line.trim().length > 0)
          .join(', ')
      : undefined
  })

  njkEnv.addFilter('formatAddressAsList', (address?: string) => {
    return address ? address.split(', ').filter(line => line.trim().length > 0) : undefined
  })

  return njkEnv
}
