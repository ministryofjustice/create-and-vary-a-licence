import { isDefined } from 'class-validator'
import {
  addressObjectToString,
  convertToTitleCase,
  hasRole,
  jsonToSimpleDateTime,
  simpleDateTimeToJson,
  stringToAddressObject,
} from './utils'
import AuthRole from '../enumeration/authRole'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import Address from '../routes/creatingLicences/types/address'

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

describe('Convert Address to comma-separated string', () => {
  it('should return all values in comma-separated string', () => {
    const address = {
      addressLine1: 'Manchester Probation Service',
      addressLine2: 'Unit 4',
      addressTown: 'Smith Street',
      addressCounty: 'Stockport',
      addressPostcode: 'SP1 3DN',
    } as unknown as Address
    expect(addressObjectToString(address)).toBe(
      'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN'
    )
  })

  it('should return comma-separated string with values missing', () => {
    const address = {
      addressLine1: 'Manchester Probation Service',
      addressLine2: null,
      addressTown: 'Smith Street',
      addressCounty: 'Stockport',
      addressPostcode: 'SP1 3DN',
    } as unknown as Address
    expect(addressObjectToString(address)).toBe('Manchester Probation Service, , Smith Street, Stockport, SP1 3DN')
  })
})

describe('Convert comma-separated string to address', () => {
  it('should construct object from string', () => {
    const address = 'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN'
    expect(stringToAddressObject(address)).toStrictEqual({
      addressLine1: 'Manchester Probation Service',
      addressLine2: 'Unit 4',
      addressTown: 'Smith Street',
      addressCounty: 'Stockport',
      addressPostcode: 'SP1 3DN',
    } as unknown as Address)
  })

  it('should construct object from string with missing values', () => {
    const address = ', , , , '
    expect(stringToAddressObject(address)).toStrictEqual({
      addressLine1: null,
      addressLine2: null,
      addressTown: null,
      addressCounty: null,
      addressPostcode: null,
    } as unknown as Address)
  })

  it('should return undefined', () => {
    expect(stringToAddressObject(undefined)).toBeUndefined()
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
  ${'30'} | ${'12'} | ${'24'}   | ${'09'} | ${'59'} | ${'pm'} | ${'30/12/2024 21:59'}
  ${'32'} | ${'01'} | ${'2025'} | ${'00'} | ${'00'} | ${'am'} | ${'null'}
`('convert simple date time to JSON date time', ({ day, month, year, hour, min, ampm, jsonDateTime }) => {
  const inductionDate = new SimpleDate(day, month, year)
  const inductionTime = new SimpleTime(hour, min, ampm === 'am' ? AmPm.AM : AmPm.PM)
  const jsonDt = simpleDateTimeToJson(SimpleDateTime.fromSimpleDateAndTime(inductionDate, inductionTime))
  if (isDefined(jsonDt)) {
    expect(jsonDt).toEqual(jsonDateTime)
  } else {
    expect(jsonDt).toBeUndefined()
  }
})
