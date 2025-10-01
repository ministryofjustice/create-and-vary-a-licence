import moment from 'moment'
import { parse, format } from 'date-fns'
import AuthRole from '../enumeration/authRole'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import type Address from '../routes/initialAppointment/types/address'
import type {
  AddressSearchResponse,
  HdcLicence,
  HdcVariationLicence,
  Licence,
  VariationLicence,
} from '../@types/licenceApiClientTypes'
import LicenceKind from '../enumeration/LicenceKind'

const CVL_DATE = 'DD/MM/YYYY'
const DATE_SHORT = 'D MMM YYYY'
const ISO_DATE = 'yyyy-MM-dd'
const JSON_DATE_TIME = 'DD/MM/YYYY HH:mm'
const SIMPLE_DATE_TIME = 'D/MM/YYYY HHmm'
const TWELVE_HOUR_TIME = 'hh:mm a'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

const hasRole = (user: Express.User, role: AuthRole): boolean => user?.userRoles.includes(role) || false

const hasAuthSource = (user: Express.User, source: string): boolean => user?.authSource === source

/**
 * Converts a date returned from nomis in the format YYYY-MM-DD to a format which is accepted by
 * create-and-vary-a-licence-api (i.e. DD/MM/YYYY)
 * @param date date to be converted.
 * @returns date converted to format DD/MM/YYYY.
 */
const convertDateFormat = (date: string): string => (date ? moment(date, 'YYYY-MM-DD').format(CVL_DATE) : undefined)

/**
 * Converts a SimpleDateTime display value to a JSON string format dd/mm/yyyy hh:mm
 * @param dt: SimpleDateTime
 */
const simpleDateTimeToJson = (dt: SimpleDateTime): string | undefined => {
  const { date, time } = dt
  const dateTimeString = [date.year, date.month, date.day, time.hour, time.minute, time.ampm].join(' ')
  const momentDt = moment(dateTimeString, 'YYYY MM DD hh mm a')
  return momentDt.isValid() ? momentDt.format(JSON_DATE_TIME) : undefined
}

/**
 * Converts a date to a SimpleDate for display in a date picker
 * @param date: a date string with format `dd/mm/yyyy`
 */
const dateStringToSimpleDate = (date: string): SimpleDate | undefined => {
  const momentDate = moment(date, SIMPLE_DATE_TIME)
  if (!momentDate.isValid()) {
    return undefined
  }
  return new SimpleDate(momentDate.format('DD'), momentDate.format('MM'), momentDate.format('YYYY'))
}

/**
 * Converts a JSON date time `dd/mm/yyyy hh:mm` to a SimpleDateTime for display
 * @param dt: string
 */
const jsonToSimpleDateTime = (dt: string): SimpleDateTime | undefined => {
  const momentDt = moment(dt, SIMPLE_DATE_TIME)
  if (!momentDt.isValid()) {
    return undefined
  }
  const simpleDate = new SimpleDate(momentDt.format('DD'), momentDt.format('MM'), momentDt.format('YYYY'))
  const ampm = momentDt.format('a') === 'am' ? AmPm.AM : AmPm.PM
  const simpleTime = new SimpleTime(momentDt.format('hh'), momentDt.format('mm'), ampm)
  return SimpleDateTime.fromSimpleDateAndTime(simpleDate, simpleTime)
}

/**
 * Converts an Address object to a comma-separated string
 * @param address: Address
 */
const addressObjectToString = (address: Address): string => {
  return Object.values(address).join(', ')
}

/**
 * Converts a comma-separated string to an address object for display
 * @param address
 */
const stringToAddressObject = (address: string): Address => {
  if (!address) {
    return undefined
  }
  const addressParts = address.split(', ')
  return {
    addressLine1: addressParts[0] || null,
    addressLine2: addressParts[1] || null,
    addressTown: addressParts[2] || null,
    addressCounty: addressParts[3] || null,
    addressPostcode: addressParts[4] || null,
  } as Address
}

const jsonDtToDate = (dt: string): string => {
  const momentDate = moment(dt, JSON_DATE_TIME)
  return momentDate.isValid() ? momentDate.format('D MMMM YYYY') : null
}

const jsonDtToDateShort = (dt: string): string => {
  const momentDate = moment(dt, JSON_DATE_TIME)
  return momentDate.isValid() ? momentDate.format(DATE_SHORT) : null
}

const jsonDtToDateWithDay = (dt: string): string => {
  const momentDate = moment(dt, JSON_DATE_TIME)
  return momentDate.isValid() ? momentDate.format('dddd D MMMM YYYY') : null
}

const jsonDtTo12HourTime = (dt: string): string => {
  const momentTime = moment(dt, JSON_DATE_TIME)
  return momentTime.isValid() ? momentTime.format(TWELVE_HOUR_TIME) : null
}

const json24HourTimeTo12HourTime = (dt: string): string => {
  const momentTime = moment(dt, 'HH:mm:ss')
  return momentTime.isValid() ? momentTime.format(TWELVE_HOUR_TIME) : null
}

const parseIsoDate = (date: string) => {
  return date ? parse(date, ISO_DATE, new Date()) : null
}

const parseCvlDate = (date: string) => {
  return date ? parse(date, 'dd/MM/yyyy', new Date()) : null
}

const toIsoDate = (date: Date) => {
  return date ? format(date, ISO_DATE) : null
}

const cvlDateToDateShort = (date: string) => {
  return date ? moment(date, CVL_DATE).format(DATE_SHORT) : 'not found'
}

const parseCvlDateTime = (date: string, { withSeconds }: { withSeconds: boolean }) => {
  if (withSeconds) {
    return date ? parse(date, 'dd/MM/yyyy HH:mm:ss', new Date()) : null
  }
  return date ? parse(date, 'dd/MM/yyyy HH:mm', new Date()) : null
}

const removeDuplicates = (list: string[]): string[] => {
  return [...new Set(list)]
}

const objectIsEmpty = (value: unknown) => {
  const empty = (val: unknown): boolean => {
    if (typeof val !== 'object') {
      return val === undefined || val === ''
    }
    return (
      val === null ||
      Object.values(val)
        .map(v => empty(v))
        .every(v => v === true)
    )
  }

  return empty(value)
}

const getFirstMaxValueKey = (params: Array<{ key: string; count: number }>): string => {
  return params.sort((a, b) => b.count - a.count)[0].key
}

const formatAddress = (address?: string) => {
  return address
    ? address
        .split(', ')
        .filter(line => line.trim().length > 0)
        .join(', ')
    : undefined
}

const formatAddressTitleCase = (address: AddressSearchResponse, isMultiple: boolean = false): string => {
  if (!address) return ''

  const { firstLine, secondLine, townOrCity, postcode } = address

  const formattedParts = [
    toAddressCase(firstLine),
    toAddressCase(secondLine),
    toAddressCase(townOrCity),
    postcode.trim(),
  ].filter(Boolean)

  return isMultiple ? formattedParts.join(', ') : formattedParts.join('<br>')
}

const formatAddressLine = (address: AddressSearchResponse): string => {
  if (!address) return ''
  const { firstLine, secondLine, townOrCity, county, postcode } = address

  const formattedParts = [
    toAddressCase(firstLine),
    toAddressCase(secondLine),
    toAddressCase(townOrCity),
    toAddressCase(county),
    postcode.trim(),
  ].filter(Boolean)

  return formattedParts.join(', ')
}

const toAddressCase = (str: string): string => {
  if (!str) return ''

  return str
    .trim()
    .split(' ')
    .map(word => {
      if (!word) return ''
      // Capitalize first letter and lowercase the rest
      const capitalized = word[0].toUpperCase() + word.slice(1).toLowerCase()
      // Capitalize letter after digit, unless preceded by a backtick
      return capitalized.replace(/(?<![`])(?<=\d)([a-z])/g, (_, letter) => letter.toUpperCase())
    })
    .join(' ')
}

const licenceIsTwoDaysToRelease = (licence: Licence) =>
  moment(licence.licenceStartDate, CVL_DATE).diff(moment(), 'days') <= 2

const groupingBy = <T extends Record<K, unknown>, K extends keyof T>(arr: T[], keyField: K): T[][] => {
  const results = arr.reduce(
    (acc, c) => {
      const key = c[keyField] as string
      const existingValues = acc[key] || []
      acc[key] = [...existingValues, c]
      return acc
    },
    {} as Record<string, T[]>,
  )

  return Object.values(results)
}

const isInHardStopPeriod = (licence: Licence): boolean => {
  return (
    licence.kind !== LicenceKind.VARIATION && licence.kind !== LicenceKind.HDC_VARIATION && licence.isInHardStopPeriod
  )
}

function isVariation(licence: Licence): licence is VariationLicence | HdcVariationLicence {
  return licence.isVariation
}

function isHdcLicence(licence: Licence): licence is HdcLicence | HdcVariationLicence {
  return licence.kind === LicenceKind.HDC || licence.kind === LicenceKind.HDC_VARIATION
}

const lowercaseFirstLetter = (message: string): string => message.charAt(0).toLowerCase() + message.slice(1)

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return ''
  const escaped = value.replace(/"/g, '""')
  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`
  }
  return escaped
}

export {
  escapeCsv,
  convertToTitleCase,
  hasRole,
  hasAuthSource,
  isBlank,
  simpleDateTimeToJson,
  dateStringToSimpleDate,
  jsonToSimpleDateTime,
  addressObjectToString,
  stringToAddressObject,
  jsonDtToDate,
  jsonDtToDateShort,
  jsonDtToDateWithDay,
  jsonDtTo12HourTime,
  json24HourTimeTo12HourTime,
  parseCvlDate,
  parseCvlDateTime,
  parseIsoDate,
  convertDateFormat,
  removeDuplicates,
  objectIsEmpty,
  getFirstMaxValueKey,
  formatAddress,
  licenceIsTwoDaysToRelease,
  groupingBy,
  isInHardStopPeriod,
  toIsoDate,
  cvlDateToDateShort,
  isVariation,
  isHdcLicence,
  formatAddressTitleCase,
  formatAddressLine,
  lowercaseFirstLetter,
}
