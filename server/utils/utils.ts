import moment from 'moment'
import { isBefore, parse, isEqual, isValid, startOfDay } from 'date-fns'
import AuthRole from '../enumeration/authRole'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import type Address from '../routes/initialAppointment/types/address'
import type { CvlPrisoner, Licence } from '../@types/licenceApiClientTypes'
import LicenceKind from '../enumeration/LicenceKind'
import config from '../config'
import { Licence as ManagedCaseLicence } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'

export type ComCreateCaseTab = 'attentionNeeded' | 'releasesInNextTwoWorkingDays' | 'futureReleases'

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
const convertDateFormat = (date: string): string => (date ? moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : undefined)

/**
 * Converts a SimpleDateTime display value to a JSON string format dd/mm/yyyy hh:mm
 * @param dt: SimpleDateTime
 */
const simpleDateTimeToJson = (dt: SimpleDateTime): string | undefined => {
  const { date, time } = dt
  const dateTimeString = [date.year, date.month, date.day, time.hour, time.minute, time.ampm].join(' ')
  const momentDt = moment(dateTimeString, 'YYYY MM DD hh mm a')
  return momentDt.isValid() ? momentDt.format('DD/MM/YYYY HH:mm') : undefined
}

/**
 * Converts a date to a SimpleDate for display in a date picker
 * @param date: a date string with format `dd/mm/yyyy`
 */
const dateStringToSimpleDate = (date: string): SimpleDate | undefined => {
  const momentDate = moment(date, 'D/MM/YYYY HHmm')
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
  const momentDt = moment(dt, 'D/MM/YYYY HHmm')
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
  const momentDate = moment(dt, 'DD/MM/YYYY HH:mm')
  return momentDate.isValid() ? momentDate.format('Do MMMM YYYY') : null
}

const jsonDtToDateShort = (dt: string): string => {
  const momentDate = moment(dt, 'DD/MM/YYYY HH:mm')
  return momentDate.isValid() ? momentDate.format('D MMM YYYY') : null
}

const jsonDtToDateWithDay = (dt: string): string => {
  const momentDate = moment(dt, 'DD/MM/YYYY HH:mm')
  return momentDate.isValid() ? momentDate.format('dddd Do MMMM YYYY') : null
}

const jsonDtTo12HourTime = (dt: string): string => {
  const momentTime = moment(dt, 'DD/MM/YYYY HH:mm')
  return momentTime.isValid() ? momentTime.format('hh:mm a') : null
}

const parseIsoDate = (date: string) => {
  return date ? parse(date, 'yyyy-MM-dd', new Date()) : null
}

const parseCvlDate = (date: string) => {
  return date ? parse(date, 'dd/MM/yyyy', new Date()) : null
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

const filterCentralCaseload = (list: string[] = []): string[] => {
  const filteredCaseload: string[] = []
  list
    .filter(cl => !cl.includes('CADM'))
    .forEach(prison => {
      filteredCaseload.push(`${prison}`)
    })
  return filteredCaseload
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

const formatAddress = (address?: string) => {
  return address
    ? address
        .split(', ')
        .filter(line => line.trim().length > 0)
        .join(', ')
    : undefined
}

const licenceIsTwoDaysToRelease = (licence: Licence) =>
  moment(licence.conditionalReleaseDate, 'DD/MM/YYYY').diff(moment(), 'days') <= 2

const selectReleaseDate = (nomisRecord: CvlPrisoner) => {
  let dateString = nomisRecord.conditionalReleaseDate

  if (nomisRecord.confirmedReleaseDate) {
    dateString = nomisRecord.confirmedReleaseDate
  }

  if (!dateString) {
    return null
  }

  const date = parseIsoDate(dateString)
  return isValid(date) ? date : null
}

const isAttentionNeeded = (
  { status, licenceStartDate }: { status: LicenceStatus; licenceStartDate?: string },
  nomisRecord: CvlPrisoner
) => {
  const today = startOfDay(new Date())
  const { APPROVED, SUBMITTED, IN_PROGRESS, NOT_STARTED } = LicenceStatus
  return (
    ([APPROVED, SUBMITTED, IN_PROGRESS, NOT_STARTED].includes(status) &&
      !nomisRecord.confirmedReleaseDate &&
      !nomisRecord.conditionalReleaseDate) || // If licence status is ‘approved’, ‘submitted’, ‘in progress' or 'not started’ AND there is no CRD/ARD
    (licenceStartDate && status === APPROVED && isBefore(parseCvlDate(licenceStartDate), today)) // If licence status is ‘approved’ AND CRD/ARD is in the past (licenceStartDate is equalto ARD/CRD)
  )
}

const determineComCreateCasesTab = (
  licence: ManagedCaseLicence,
  nomisRecord: CvlPrisoner,
  cutOffDateString: string
): ComCreateCaseTab => {
  if (licence && isAttentionNeeded(licence, nomisRecord)) {
    return 'attentionNeeded'
  }

  const releaseDate = selectReleaseDate(nomisRecord)
  const cutOffDate = parseCvlDate(cutOffDateString)
  return isReleaseDateOnOrBeforeCutOffDate(cutOffDate, releaseDate) ? 'releasesInNextTwoWorkingDays' : 'futureReleases'
}

const isReleaseDateOnOrBeforeCutOffDate = (cutOffDate: Date, releaseDate: Date): boolean => {
  return isBefore(releaseDate, cutOffDate) || isEqual(releaseDate, cutOffDate)
}

const groupingBy = <T extends Record<K, unknown>, K extends keyof T>(arr: T[], keyField: K): T[][] => {
  const results = arr.reduce(
    (acc, c) => {
      const key = c[keyField] as string
      const existingValues = acc[key] || []
      acc[key] = [...existingValues, c]
      return acc
    },
    {} as Record<string, T[]>
  )

  return Object.values(results)
}

const isInHardStopPeriod = (licence: Licence): boolean => {
  return config.hardStopEnabled && licence.kind !== LicenceKind.VARIATION && licence.isInHardStopPeriod
}

export {
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
  parseCvlDate,
  parseCvlDateTime,
  parseIsoDate,
  convertDateFormat,
  removeDuplicates,
  filterCentralCaseload,
  objectIsEmpty,
  formatAddress,
  licenceIsTwoDaysToRelease,
  selectReleaseDate,
  groupingBy,
  isReleaseDateOnOrBeforeCutOffDate,
  isInHardStopPeriod,
  isAttentionNeeded,
  determineComCreateCasesTab,
}
