import { isDefined } from 'class-validator'
import { convertToTitleCase, hasRole, jsonToSimpleDateTime, simpleDateTimeToJson } from './utils'
import AuthRole from '../enumeration/authRole'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'

describe('Convert to title case', () => {
  it('null string', () => {
    expect(convertToTitleCase(null)).toEqual('')
  })
  it('empty string', () => {
    expect(convertToTitleCase('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(convertToTitleCase('robert')).toEqual('Robert')
  })
  it('Upper Case', () => {
    expect(convertToTitleCase('ROBERT')).toEqual('Robert')
  })
  it('Mixed Case', () => {
    expect(convertToTitleCase('RoBErT')).toEqual('Robert')
  })
  it('Multiple words', () => {
    expect(convertToTitleCase('RobeRT SMiTH')).toEqual('Robert Smith')
  })
  it('Leading spaces', () => {
    expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(convertToTitleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
  })
})

describe("Check user's role", () => {
  it('should return false if user is null', () => {
    expect(hasRole(null, AuthRole.DECISION_MAKER)).toBe(false)
  })

  it('should return true if user has role', () => {
    const user = { userRoles: [AuthRole.CASE_ADMIN, AuthRole.DECISION_MAKER] } as Express.User
    expect(hasRole(user, AuthRole.CASE_ADMIN)).toBe(true)
  })

  it('should false true if user does not have role', () => {
    const user = { userRoles: [] } as Express.User
    expect(hasRole(user, AuthRole.CASE_ADMIN)).toBe(false)
  })
})

test.each`
  jsonDateTime          | day       | month     | year      | hour      | min       | ampm
  ${'12/12/2021 23:15'} | ${'12'}   | ${'12'}   | ${'2021'} | ${'11'}   | ${'15'}   | ${'pm'}
  ${'31/01/2022 12:01'} | ${'31'}   | ${'01'}   | ${'2022'} | ${'12'}   | ${'01'}   | ${'pm'}
  ${'31/01/2022 00:00'} | ${'31'}   | ${'01'}   | ${'2022'} | ${'12'}   | ${'00'}   | ${'am'}
  ${'01/01/2022 00:01'} | ${'01'}   | ${'01'}   | ${'2022'} | ${'12'}   | ${'01'}   | ${'am'}
  ${'22/10/2024 14:23'} | ${'22'}   | ${'10'}   | ${'2024'} | ${'02'}   | ${'23'}   | ${'pm'}
  ${'30/12/2024 21:59'} | ${'30'}   | ${'12'}   | ${'2024'} | ${'09'}   | ${'59'}   | ${'pm'}
  ${'32/01/2025 00:00'} | ${'null'} | ${'null'} | ${'null'} | ${'null'} | ${'null'} | ${'null'}
`('convert JSON datetime to simple datetime', ({ jsonDateTime, day, month, year, hour, min, ampm }) => {
  const simpleDateTime = jsonToSimpleDateTime(jsonDateTime)
  if (isDefined(simpleDateTime)) {
    const { inductionDate, inductionTime } = simpleDateTime
    expect(inductionDate?.day).toEqual(day)
    expect(inductionDate?.month).toEqual(month)
    expect(inductionDate?.year).toEqual(year)
    expect(inductionTime?.hour).toEqual(hour)
    expect(inductionTime?.minute).toEqual(min)
    expect(inductionTime?.ampm).toEqual(ampm)
  } else {
    expect(simpleDateTime).toBeUndefined()
  }
})

test.each`
  day     | month   | year      | hour    | min     | ampm    | jsonDateTime
  ${'12'} | ${'12'} | ${'2021'} | ${'11'} | ${'15'} | ${'pm'} | ${'12/12/2021 23:15'}
  ${'31'} | ${'01'} | ${'2022'} | ${'12'} | ${'01'} | ${'pm'} | ${'31/01/2022 12:01'}
  ${'31'} | ${'12'} | ${'2022'} | ${'12'} | ${'00'} | ${'pm'} | ${'31/12/2022 12:00'}
  ${'31'} | ${'12'} | ${'2022'} | ${'12'} | ${'00'} | ${'am'} | ${'31/12/2022 00:00'}
  ${'1'}  | ${'1'}  | ${'2022'} | ${'1'}  | ${'1'}  | ${'am'} | ${'01/01/2022 01:01'}
  ${'22'} | ${'10'} | ${'2024'} | ${'2'}  | ${'23'} | ${'pm'} | ${'22/10/2024 14:23'}
  ${'30'} | ${'12'} | ${'2024'} | ${'09'} | ${'59'} | ${'pm'} | ${'30/12/2024 21:59'}
  ${'32'} | ${'01'} | ${'2025'} | ${'00'} | ${'00'} | ${'am'} | ${'null'}
`('convert simple date time to JSON date time', ({ day, month, year, hour, min, ampm, jsonDateTime }) => {
  const inductionDate = new SimpleDate()
  inductionDate.day = day
  inductionDate.month = month
  inductionDate.year = year

  const inductionTime = new SimpleTime()
  inductionTime.hour = hour
  inductionTime.minute = min
  inductionTime.ampm = ampm === 'am' ? AmPm.AM : AmPm.PM

  const simpleDateTime = new SimpleDateTime()
  simpleDateTime.inductionDate = inductionDate
  simpleDateTime.inductionTime = inductionTime

  const jsonDt = simpleDateTimeToJson(simpleDateTime)
  if (isDefined(jsonDt)) {
    expect(jsonDt).toEqual(jsonDateTime)
  } else {
    expect(jsonDt).toBeUndefined()
  }
})
