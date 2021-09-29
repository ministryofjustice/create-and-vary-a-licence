import moment from 'moment'
import AuthRole from '../enumeration/authRole'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import Address from '../routes/creatingLicences/types/address'

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

/**
 * Converts a SimpleDateTime display value to a JSON string format dd/mm/yyyy hh:mm
 * @param dt: SimpleDateTime
 */
const simpleDateTimeToJson = (dt: SimpleDateTime): string | undefined => {
  const { inductionDate, inductionTime } = dt
  const dateTimeString = [
    inductionDate.year,
    inductionDate.month,
    inductionDate.day,
    inductionTime.hour,
    inductionTime.minute,
    inductionTime.ampm,
  ].join(' ')
  const momentDt = moment(dateTimeString, 'YYYY MM DD hh mm a')
  return momentDt.isValid() ? momentDt.format('DD/MM/YYYY HH:mm') : undefined
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
 * @param address: SimpleDateTime
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

export {
  convertToTitleCase,
  hasRole,
  simpleDateTimeToJson,
  jsonToSimpleDateTime,
  addressObjectToString,
  stringToAddressObject,
}
