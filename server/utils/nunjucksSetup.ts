/* eslint-disable no-param-reassign */
import nunjucks, { Environment } from 'nunjucks'
import express from 'express'
import path from 'path'
import moment from 'moment'
import { FieldValidationError } from '../middleware/validationMiddleware'
import config from '../config'
import { formatAddress, jsonDtTo12HourTime, jsonDtToDate, jsonDtToDateShort, jsonDtToDateWithDay } from './utils'
import { AdditionalCondition, AdditionalConditionData } from '../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from './conditionsProvider'
import SimpleTime from '../routes/creatingLicences/types/time'
import SimpleDate from '../routes/creatingLicences/types/date'
import Address from '../routes/creatingLicences/types/address'
import LicenceStatus from '../enumeration/licenceStatus'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Create and vary a licence'

  // Set the values for the phase banner and exit survey links from config
  app.locals.phaseBannerLink = config.phaseBannerLink
  app.locals.exitSurveyLink = config.exitSurveyLink

  // Set the value of the auth home link from config
  app.locals.authHome = config.apis.hmppsAuth.url

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

  // Expose the google tag manager container ID to the nunjucks environment
  const {
    analytics: { tagManagerContainerId },
  } = config

  // Needs to trim - in case of newline in value
  njkEnv.addGlobal('tagManagerContainerId', tagManagerContainerId?.trim())

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

  njkEnv.addFilter(
    'additionalConditionChecked',
    (conditionId: string, additionalConditions: Record<string, unknown>[]) => {
      return additionalConditions?.find(c => c.code === conditionId) !== undefined
    }
  )

  njkEnv.addFilter('getValuesFromSimpleDates', (formValues: unknown[], index = 0) => {
    const dates = formValues.map(value => (typeof value === 'string' ? SimpleDate.fromString(value) : value))
    return dates[index]
  })

  njkEnv.addFilter('getValuesFromSimpleTimes', (formValues: unknown[], index = 0) => {
    const times = formValues.map(value => (typeof value === 'string' ? SimpleTime.fromString(value) : value))
    return times[index]
  })

  njkEnv.addFilter('getValueFromAddress', (formValues: unknown[], property: string, index = 0) => {
    const addresses = formValues.map(value => (typeof value === 'string' ? Address.fromString(value) : value))
    return addresses[index] ? addresses[index][property] : ''
  })

  njkEnv.addFilter('checkConditionRequiresInput', (additionalCondition: AdditionalCondition) => {
    return getAdditionalConditionByCode(additionalCondition.code).requiresInput
  })

  njkEnv.addFilter('datetimeToDate', (dt: string) => {
    return jsonDtToDate(dt)
  })

  njkEnv.addFilter('datetimeToDateShort', (dt: string) => {
    return jsonDtToDateShort(dt)
  })

  njkEnv.addFilter('datetimeToDateWithDay', (dt: string) => {
    return jsonDtToDateWithDay(dt)
  })

  njkEnv.addFilter('datetimeTo12HourTime', (dt: string) => {
    return jsonDtTo12HourTime(dt)
  })

  njkEnv.addFilter('formatAddress', formatAddress)

  njkEnv.addFilter('formatAddressAsList', (address?: string) => {
    return address ? address.split(', ').filter(line => line.trim().length > 0) : undefined
  })

  njkEnv.addFilter('formatListAsString', (list?: string[]): string => {
    if (list) {
      return `[${list.map(i => `'${i}'`).join(',')}]`
    }
    return '[]'
  })

  njkEnv.addFilter('separatedDataByFieldName', (data: AdditionalConditionData[]) => {
    const map = new Map()
    data.forEach(item => {
      const collection = map.get(item.field)
      if (!collection) {
        map.set(item.field, [item])
      } else {
        collection.push(item)
      }
    })
    return Array.from(map, ([fieldName, items]) => ({ fieldName, items })).map(groupedDataItems => {
      return groupedDataItems.items.map((dataItem: AdditionalConditionData) => dataItem.value).join(', ')
    })
  })

  njkEnv.addFilter('dateToUnix', (date: string) => {
    return moment(date, 'D MMM YYYY').unix()
  })

  njkEnv.addFilter('getStatusOrder', (licenceStatus: LicenceStatus) => {
    const licenceStatusOrderMap = new Map()

    licenceStatusOrderMap.set(LicenceStatus.NOT_STARTED, 0)
    licenceStatusOrderMap.set(LicenceStatus.IN_PROGRESS, 1)
    licenceStatusOrderMap.set(LicenceStatus.SUBMITTED, 2)
    licenceStatusOrderMap.set(LicenceStatus.APPROVED, 3)
    licenceStatusOrderMap.set(LicenceStatus.ACTIVE, 4)

    return licenceStatusOrderMap.get(licenceStatus)
  })

  njkEnv.addGlobal('getFormResponses', (formResponses: unknown, inputName: string) => {
    return formResponses ? [formResponses[inputName]].flat() : undefined
  })

  njkEnv.addGlobal('getValueFromAdditionalCondition', (additionalCondition: AdditionalCondition, inputName: string) => {
    return additionalCondition
      ? additionalCondition.data.filter(item => item.field === inputName).map(item => item.value)
      : undefined
  })

  njkEnv.addFilter('extractAttr', (array, key) => {
    return array.map((item: string) => {
      return item[key]
    })
  })

  njkEnv.addFilter('toChecked', <T>(array: T[], valueKey: string, textKey: string, values: T[] = []) => {
    return array.map(item => ({
      value: item[valueKey],
      text: item[textKey],
      checked: values.includes(item[valueKey]),
    }))
  })

  njkEnv.addFilter('toUpper', val => {
    return val?.toUpperCase()
  })

  return njkEnv
}
