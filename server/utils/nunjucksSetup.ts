import path from 'path'
import nunjucks, { Environment } from 'nunjucks'
import { isToday, isYesterday, format, startOfDay } from 'date-fns'
import express from 'express'
import moment from 'moment'
import { filesize } from 'filesize'
import { setUpNunjucksFilters } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/setUpNunjucksFilters'
import { FieldValidationError } from '../middleware/validationMiddleware'
import config from '../config'
import type { ApplicationInfo } from '../applicationInfo'
import {
  formatAddress,
  jsonDtTo12HourTime,
  json24HourTimeTo12HourTime,
  jsonDtToDate,
  jsonDtToDateWithDay,
  parseCvlDate,
  toIsoDate,
  cvlDateToDateShort,
  formatAddressTitleCase,
  formatAddressLine,
} from './utils'
import { AdditionalCondition, AdditionalConditionData, Licence, FoundComCase } from '../@types/licenceApiClientTypes'
import SimpleTime from '../routes/creatingLicences/types/time'
import SimpleDate from '../routes/creatingLicences/types/date'
import Address from '../routes/initialAppointment/types/address'
import { getEditConditionHref, getDeleteConditionHref } from './conditionRoutes'
import { LegalStatus, AppointmentTimeType, LicenceKind, CaViewCasesTab, LicenceStatus } from '../enumeration'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): Environment {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Create and vary a licence'

  // Set the value of the auth home link from config
  app.locals.authHome = config.apis.hmppsAuth.url

  // Set domain url on current environment
  app.locals.domain = config.domain

  // Cachebusting version string
  if (production) {
    // Version only changes with each commit
    app.locals.version = applicationInfo.gitShortHash
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  return registerNunjucks(app)
}

export function registerNunjucks(app?: express.Express): Environment {
  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/',
      'node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )
  setUpNunjucksFilters(njkEnv)

  // Expose the google tag manager container ID to the nunjucks environment
  const {
    analytics: { tagManagerContainerId },
  } = config

  // Needs to trim - in case of newline in value
  njkEnv.addGlobal('tagManagerContainerId', tagManagerContainerId?.trim())

  // To aid development, this can be used to inspect the structure of an object in a template
  njkEnv.addFilter(
    'dumpJson',
    (val: string) => new nunjucks.runtime.SafeString(`<pre>${JSON.stringify(val, null, 2)}</pre>`),
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
      text: error.summaryMessage || error.message,
      href: `#${error.field}`,
    }))
  })

  // eslint-disable-next-line default-param-last
  njkEnv.addFilter('findError', (array: FieldValidationError[] = [], formFieldId: string) => {
    const item = array.find(error => error.field === formFieldId)
    if (item) {
      return {
        text: item.message,
      }
    }
    return null
  })

  njkEnv.addFilter('getAppointmentTimeTypeDescription', (type: string) => {
    const appointmentTimeType: Record<string, string> = AppointmentTimeType
    return appointmentTimeType[type]
  })

  njkEnv.addFilter('filterByTabType', (licences: Record<string, unknown>[], type: CaViewCasesTab) =>
    licences.filter(c => c.tabType === type),
  )

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
    },
  )

  njkEnv.addFilter('getValuesFromSimpleDates', (formValues: unknown[], index = 0) => {
    const dates = formValues.map(value => (typeof value === 'string' ? SimpleDate.fromString(value) : value))
    return dates[index]
  })

  njkEnv.addFilter('getValuesFromSimpleTimes', (formValues: unknown[], index = 0) => {
    const times = formValues.map(value => (typeof value === 'string' ? SimpleTime.fromString(value) : value))
    return times[index]
  })

  njkEnv.addFilter('getValueFromAddress', (formValues: string[], property: keyof Address, index = 0) => {
    const addresses = formValues.map(value => (typeof value === 'string' ? Address.fromString(value) : value))
    return addresses[index] ? addresses[index][property] : ''
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

  njkEnv.addFilter('format24HourTimeTo12HourTime', (dt: string) => {
    return json24HourTimeTo12HourTime(dt)
  })

  njkEnv.addFilter('formatAddress', formatAddress)

  njkEnv.addFilter('formatAddressAsList', (address?: string) => {
    return address ? address.split(', ').filter(line => line.trim().length > 0) : undefined
  })

  njkEnv.addFilter('formatLicenceAddressAsList', addressObj => {
    if (!addressObj) return undefined

    const { firstLine, secondLine, townOrCity, county, postcode } = addressObj

    return [firstLine, secondLine, townOrCity, county, postcode].filter(part => part && part.trim().length > 0)
  })

  njkEnv.addFilter('formatAddressLine', formatAddressLine)

  njkEnv.addFilter('formatListAsString', (list?: string[]): string => {
    if (list) {
      return `[${list.map(i => `'${i}'`).join(',')}]`
    }
    return '[]'
  })

  njkEnv.addFilter('separatedDataByFieldName', (data: AdditionalConditionData[]) => {
    const map = new Map()
    data.forEach(item => {
      if (!item.contributesToLicence) {
        return
      }
      const collection = map.get(item.field)
      if (!collection) {
        map.set(item.field, [item])
      } else {
        collection.push(item)
      }
    })
    return Array.from(map, ([fieldName, items]) => ({
      fieldName,
      items,
    })).map(groupedDataItems => {
      return groupedDataItems.items.map((dataItem: AdditionalConditionData) => dataItem.value).join(', ')
    })
  })

  njkEnv.addFilter('dateToUnix', (date: string) => {
    return moment(date, 'D MMM YYYY').unix()
  })

  njkEnv.addFilter('toIsoDate', toIsoDate)

  njkEnv.addFilter('cvlDateToDateShort', cvlDateToDateShort)

  njkEnv.addFilter('getStatusOrder', (licenceStatus: LicenceStatus) => {
    const licenceStatusOrderMap = new Map()

    licenceStatusOrderMap.set(LicenceStatus.NOT_STARTED, 0)
    licenceStatusOrderMap.set(LicenceStatus.IN_PROGRESS, 1)
    licenceStatusOrderMap.set(LicenceStatus.SUBMITTED, 2)
    licenceStatusOrderMap.set(LicenceStatus.APPROVED, 3)
    licenceStatusOrderMap.set(LicenceStatus.ACTIVE, 4)

    return licenceStatusOrderMap.get(licenceStatus)
  })

  njkEnv.addGlobal('getFormResponses', (formResponses: Record<string, unknown>, inputName: string) => {
    return formResponses ? [formResponses[inputName]].flat() : undefined
  })

  njkEnv.addGlobal('getValueFromAdditionalCondition', (additionalCondition: AdditionalCondition, inputName: string) => {
    return additionalCondition
      ? additionalCondition.data.filter(item => item.field === inputName).map(item => item.value)
      : undefined
  })

  njkEnv.addGlobal(
    'additionalConditionRow',
    (licence: Licence, condition: AdditionalCondition, html: string, isEditable: boolean) => {
      const { requiresInput, id, code, category, sequence } = condition

      const getActionItem = () => {
        const href = requiresInput
          ? getEditConditionHref({
              licenceId: licence.id,
              conditionId: id,
              conditionCode: code,
              fromReview: true,
            })
          : getDeleteConditionHref({
              licenceId: licence.id,
              conditionId: id,
              fromReview: true,
            })

        const actionType = requiresInput ? 'Change' : 'Delete'

        return {
          href,
          text: actionType,
          visuallyHiddenText: `${actionType} condition`,
          attributes: {
            'data-qa': `condition-action-${code}`,
          },
        }
      }

      return {
        sequence,
        key: { text: category },
        value: { html },
        actions: {
          items: isEditable ? [getActionItem()] : [],
        },
      }
    },
  )

  njkEnv.addFilter('map', (array, f) => {
    return array.map(f)
  })

  njkEnv.addFilter('addQueryParam', (url: string, name: string, value: string) => {
    if (value === undefined) return url
    return `${url}${url.includes('?') ? '&' : '?'}${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  })

  njkEnv.addFilter('extractAttr', (array, key) => {
    return array.map((item: string) => {
      return item[key]
    })
  })

  njkEnv.addFilter(
    'toChecked',
    <T extends Record<string, unknown>>(array: T[], valueKey: string, textKey: string, values: unknown[] = []) => {
      return array.map(item => ({
        value: item[valueKey],
        text: item[textKey],
        checked: values.includes(item[valueKey]),
      }))
    },
  )

  njkEnv.addFilter('sortConditionsBySequence', (array: AdditionalCondition[]) => {
    return array.sort((a, b) => a.sequence - b.sequence)
  })

  njkEnv.addFilter('sortConditionsById', (array: AdditionalCondition[]) => {
    return array.sort((a, b) => a.id - b.id)
  })

  njkEnv.addFilter('humanReadableFileSize', (numberOfBytes: number) =>
    filesize(numberOfBytes || 0, { base: 2, standard: 'jedec' }),
  )

  njkEnv.addFilter('humanReadableMimeType', (mimeType: string) => {
    switch (mimeType) {
      case 'application/pdf':
        return 'PDF'
      default:
        return mimeType
    }
  })

  njkEnv.addFilter('dateToDisplay', (licence: Licence) => {
    const licenceType = licence.typeCode
    const led = licence.licenceExpiryDate ? parseCvlDate(licence.licenceExpiryDate) : null
    const tussd = licence.topupSupervisionStartDate ? parseCvlDate(licence.topupSupervisionStartDate) : null
    const tused = licence.topupSupervisionExpiryDate ? parseCvlDate(licence.topupSupervisionExpiryDate) : null

    let dateToDisplay: Date
    let textToDisplay = ''

    if (licenceType === 'AP' || licenceType === 'AP_PSS') {
      textToDisplay = 'Licence end date'
      dateToDisplay = led
    }

    const conditionsToDisplayTused =
      (licenceType === 'AP_PSS' && tussd && isToday(tussd)) ||
      (licenceType === 'AP_PSS' && !tussd && tused && led && isYesterday(led)) ||
      licenceType === 'PSS'

    if (conditionsToDisplayTused) {
      textToDisplay = 'PSS end date'
      dateToDisplay = tused
    }

    if (dateToDisplay) {
      return `${textToDisplay}: ${format(dateToDisplay, 'd MMMM yyyy')}`
    }

    return `${textToDisplay}: Not available`
  })

  njkEnv.addFilter('pluralise', (number: number, word: string, singular = '', plural = 's') => {
    if (number === 1) {
      return word + singular
    }
    return word + plural
  })

  njkEnv.addFilter('titlecase', (word: string) => {
    if (!word) return word
    return word[0].toUpperCase() + word.substring(1).toLowerCase()
  })

  njkEnv.addFilter('createOffenderLink', (foundComCase: FoundComCase): string => {
    const isTimedOutLicence = foundComCase?.licenceStatus === 'TIMED_OUT'
    const isPrisonCreated = foundComCase?.kind === 'HARD_STOP' || foundComCase?.kind === 'TIME_SERVED'

    if (isTimedOutLicence && foundComCase.versionOf) {
      return `/licence/create/id/${foundComCase.licenceId}/licence-changes-not-approved-in-time`
    }

    if (isTimedOutLicence || (isPrisonCreated && foundComCase.licenceStatus === LicenceStatus.IN_PROGRESS)) {
      return `/licence/create/nomisId/${foundComCase.nomisId}/prison-will-create-this-licence`
    }

    if (isPrisonCreated) {
      return `/licence/create/id/${foundComCase.licenceId}/licence-created-by-prison`
    }

    if (!foundComCase.licenceId) {
      return `/licence/create/nomisId/${foundComCase.nomisId}/confirm`
    }

    return `/licence/create/id/${foundComCase.licenceId}/check-your-answers`
  })

  njkEnv.addFilter('getlicenceStatusForSearchResults', (licence: FoundComCase): LicenceStatus => {
    if (licence.isReviewNeeded) {
      return LicenceStatus.REVIEW_NEEDED
    }

    const isTimedOutLicence = licence?.kind === 'HARD_STOP' || licence?.kind === 'TIME_SERVED'
    if (isTimedOutLicence) {
      return LicenceStatus.TIMED_OUT
    }

    return <LicenceStatus>licence.licenceStatus
  })

  njkEnv.addFilter('legalStatus', (status: string) => {
    const legalStatus: Record<string, string> = LegalStatus
    return legalStatus[status]
  })

  njkEnv.addFilter(
    'shouldShowHardStopWarning',
    (licence: { kind: LicenceKind; hardStopWarningDate: string; hardStopDate: string }): boolean => {
      if (!licence.hardStopWarningDate || !licence.hardStopDate) {
        return false
      }
      const now = startOfDay(new Date())
      return (
        licence.kind !== LicenceKind.VARIATION &&
        licence.kind !== LicenceKind.HDC_VARIATION &&
        parseCvlDate(licence.hardStopWarningDate) <= now &&
        now < parseCvlDate(licence.hardStopDate)
      )
    },
  )

  njkEnv.addFilter('localTimeTo12h', (time: string): string => {
    if (!time) {
      return undefined
    }
    const [hour, minute] = time.split(':')
    const hourInt = parseInt(hour, 10)
    if (hourInt > 12) {
      return `${hourInt - 12}${minute === '00' ? '' : `:${minute}`}pm`
    }
    return `${hourInt}${minute === '00' ? '' : `:${minute}`}am`
  })

  njkEnv.addFilter('formatAddressTitleCase', (address, isMultiple) => formatAddressTitleCase(address, isMultiple))

  njkEnv.addFilter('redactIfLao', (value: string, offender: { isRestricted?: boolean }): string => {
    if (config.laoEnabled && offender?.isRestricted) {
      return 'Restricted'
    }
    return value
  })

  njkEnv.addGlobal('dpsUrl', config.dpsUrl)
  njkEnv.addGlobal('serviceNowUrl', config.serviceNowUrl)
  njkEnv.addGlobal('epf2Url', config.epf2Url)
  njkEnv.addGlobal('serviceName', config.serviceName)
  njkEnv.addGlobal('showWhatsNewBanner', config.showWhatsNewBanner)
  njkEnv.addGlobal('fridayReleasePolicy', config.fridayReleasePolicy)
  njkEnv.addGlobal('hdcEnabled', config.hdcEnabled)
  njkEnv.addGlobal('postcodeLookupEnabled', config.postcodeLookupEnabled)
  njkEnv.addGlobal('timeServedEnabled', config.timeServed.enabled)
  njkEnv.addGlobal('timeServedSurveyUrl', config.timeServed.surveyUrl)
  njkEnv.addGlobal('timeServedServiceNowUrl', config.timeServed.serviceNowUrl)
  njkEnv.addGlobal('laoEnabled', config.laoEnabled)

  return njkEnv
}
