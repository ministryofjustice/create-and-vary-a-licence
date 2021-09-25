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
const simpleDateTimeToJson = (dt: SimpleDateTime): string => {
  const { inductionDate, inductionTime } = dt
  const momentDt = moment(
    [inductionDate.year, inductionDate.month, inductionDate.day].join('-'),
    ['YYYY-M-D', 'YY-M-D'],
    true
  )

  if (!momentDt.isValid()) {
    return undefined
  }

  // Adjust hours to 24 hr clock
  if (inductionTime.ampm === 'pm') {
    const hour = +inductionTime.hour < 12 ? +inductionTime.hour + 12 : +inductionTime.hour
    momentDt.add(hour, 'hours')
  } else {
    const hour = +inductionTime.hour === 12 ? +inductionTime.hour - 12 : +inductionTime.hour
    momentDt.add(hour, 'hours')
  }

  momentDt.add(+inductionTime.minute, 'minutes')
  const strDate = momentDt.format('DD/MM/YYYY HH:mm')
  return strDate
}

/**
 * Converts a JSON date time dd/mm/yyyy hh:mm to a SimpleDateTime for display
 * @param dt: string
 */
const jsonToSimpleDateTime = (dt: string): SimpleDateTime => {
  const momentDt = moment(dt, 'D/MM/YYYY HHmm')
  if (!momentDt.isValid()) {
    return undefined
  }
  const simpleTime = new SimpleTime()
  simpleTime.hour = momentDt.format('hh')
  simpleTime.minute = momentDt.format('mm')
  simpleTime.ampm = momentDt.format('a') === 'am' ? AmPm.AM : AmPm.PM

  const simpleDate = new SimpleDate()
  simpleDate.day = momentDt.format('DD')
  simpleDate.month = momentDt.format('MM')
  simpleDate.year = momentDt.format('YYYY')

  const simpleDateTime = new SimpleDateTime()
  simpleDateTime.inductionDate = simpleDate
  simpleDateTime.inductionTime = simpleTime
  return simpleDateTime
}

export { convertToTitleCase, hasRole, simpleDateTimeToJson, jsonToSimpleDateTime }
