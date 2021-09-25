import moment from 'moment'
import AuthRole from '../enumeration/authRole'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'

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
  const momentDt = moment(
    [inductionDate.year, inductionDate.month, inductionDate.day].join('-'),
    ['YYYY-M-D', 'YY-M-D'],
    true
  )
  if (!momentDt.isValid()) {
    return undefined
  }
  let hour
  if (inductionTime.ampm === 'pm') {
    hour = +inductionTime.hour < 12 ? +inductionTime.hour + 12 : +inductionTime.hour
  } else {
    hour = +inductionTime.hour === 12 ? +inductionTime.hour - 12 : +inductionTime.hour
  }
  momentDt.add(hour, 'hours')
  momentDt.add(+inductionTime.minute, 'minutes')
  return momentDt.format('DD/MM/YYYY HH:mm')
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

export { convertToTitleCase, hasRole, simpleDateTimeToJson, jsonToSimpleDateTime }
