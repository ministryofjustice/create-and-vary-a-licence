import { isDefined } from 'class-validator'
import { format, isValid } from 'date-fns'
import {
  addressObjectToString,
  convertDateFormat,
  convertToTitleCase,
  hasRole,
  jsonToSimpleDateTime,
  simpleDateTimeToJson,
  stringToAddressObject,
  jsonDtTo12HourTime,
  json24HourTimeTo12HourTime,
  jsonDtToDate,
  removeDuplicates,
  jsonDtToDateWithDay,
  objectIsEmpty,
  getFirstMaxValueKey,
  hasAuthSource,
  licenceIsTwoDaysToRelease,
  groupingBy,
  isInHardStopPeriod,
  parseIsoDate,
  parseCvlDate,
  parseCvlDateTime,
  toIsoDate,
  cvlDateToDateShort,
  isVariation,
  isHdcLicence,
  lowercaseFirstLetter,
  escapeCsv,
  isTimeServedLicence,
  mapToTargetField,
} from './utils'
import AuthRole from '../enumeration/authRole'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import Address from '../routes/initialAppointment/types/address'
import type { Licence } from '../@types/licenceApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceKind from '../enumeration/LicenceKind'

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

  it('should false if user does not have role', () => {
    const user = { userRoles: [] } as Express.User
    expect(hasRole(user, AuthRole.CASE_ADMIN)).toBe(false)
  })
})

describe("Check user's auth source", () => {
  it('should return false if user is null', () => {
    expect(hasAuthSource(null, 'delius')).toBe(false)
  })

  it('should return true if user has correct auth source', () => {
    const user = { authSource: 'delius' } as Express.User
    expect(hasAuthSource(user, 'delius')).toBe(true)
  })

  it('should false if user does not have the correct auth source', () => {
    const user = { authSource: 'nomis' } as Express.User
    expect(hasAuthSource(user, 'delius')).toBe(false)
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
      'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN',
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

describe('Convert date format', () => {
  it('should return YYYY-MM-DD date in format DD/MM/YYYY', () => {
    const date = '2015-04-26'
    expect(convertDateFormat(date)).toEqual('26/04/2015')
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
    const { date, time } = simpleDateTime
    expect(date?.day).toEqual(day)
    expect(date?.month).toEqual(month)
    expect(date?.year).toEqual(year)
    expect(time?.hour).toEqual(hour)
    expect(time?.minute).toEqual(min)
    expect(time?.ampm).toEqual(ampm)
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

test.each`
  jsonDateTime          | time12Hour
  ${'12/12/2021 23:15'} | ${'11:15 pm'}
  ${'31/01/2022 12:01'} | ${'12:01 pm'}
  ${'31/12/2022 12:00'} | ${'12:00 pm'}
  ${'31/12/2022 00:00'} | ${'12:00 am'}
  ${'01/01/2022 01:01'} | ${'01:01 am'}
  ${'22/10/2024 14:23'} | ${'02:23 pm'}
  ${'22/10/24 14:23'}   | ${'02:23 pm'}
  ${'null'}             | ${'null'}
`('convert JSON datetime to 12 hour time value', ({ jsonDateTime, time12Hour }) => {
  const timeValue = jsonDtTo12HourTime(jsonDateTime)
  if (isDefined(timeValue)) {
    expect(timeValue).toEqual(time12Hour)
  } else {
    expect(timeValue).toBeNull()
  }
})

test.each`
  time24Hour    | time12Hour
  ${'23:15:00'} | ${'11:15 pm'}
  ${'12:01:00'} | ${'12:01 pm'}
  ${'12:00:00'} | ${'12:00 pm'}
  ${'00:00:00'} | ${'12:00 am'}
  ${'01:01:00'} | ${'01:01 am'}
  ${'14:23:00'} | ${'02:23 pm'}
  ${'14:23:00'} | ${'02:23 pm'}
  ${'null'}     | ${'null'}
`('convert JSON 24 hour time to 12 hour time value', ({ time24Hour, time12Hour }) => {
  const timeValue = json24HourTimeTo12HourTime(time24Hour)
  if (isDefined(timeValue)) {
    expect(timeValue).toEqual(time12Hour)
  } else {
    expect(timeValue).toBeNull()
  }
})

test.each`
  jsonDateTime          | dateFull
  ${'12/12/2021 23:15'} | ${'12 December 2021'}
  ${'31/01/2022 12:01'} | ${'31 January 2022'}
  ${'31/12/2022 12:00'} | ${'31 December 2022'}
  ${'31/12/2022 00:00'} | ${'31 December 2022'}
  ${'01/01/2022 01:01'} | ${'1 January 2022'}
  ${'22/10/2024 14:23'} | ${'22 October 2024'}
  ${'22/10/24 14:23'}   | ${'22 October 2024'}
  ${'22/10/24'}         | ${'22 October 2024'}
  ${'null'}             | ${'null'}
`('convert JSON datetime to long date', ({ jsonDateTime, dateFull }) => {
  const dateValue = jsonDtToDate(jsonDateTime)
  if (isDefined(dateValue)) {
    expect(dateValue).toEqual(dateFull)
  } else {
    expect(dateValue).toBeNull()
  }
})

test.each`
  jsonDateTime          | dateFull
  ${'12/12/2021 23:15'} | ${'Sunday 12 December 2021'}
  ${'31/01/2022 12:01'} | ${'Monday 31 January 2022'}
  ${'31/12/2022 12:00'} | ${'Saturday 31 December 2022'}
  ${'null'}             | ${'null'}
`('convert JSON datetime to date with full day', ({ jsonDateTime, dateFull }) => {
  const dateValue = jsonDtToDateWithDay(jsonDateTime)
  if (isDefined(dateValue)) {
    expect(dateValue).toEqual(dateFull)
  } else {
    expect(dateValue).toBeNull()
  }
})

describe('parseIsoDate', () => {
  it('ignores null', () => {
    expect(parseIsoDate(null)).toEqual(null)
  })
  it('ignores empty string', () => {
    expect(parseIsoDate('')).toEqual(null)
  })
  it('parses valid date', () => {
    expect(format(parseIsoDate('2023-01-24'), 'yyyy-MM-dd')).toEqual('2023-01-24')
  })
  it('fails to parse invalid date format', () => {
    const date = parseIsoDate('23/01/2023')
    expect(isValid(date)).toEqual(false)
  })
  it('fails to parse invalid date', () => {
    const date = parseIsoDate('invalid date')
    expect(isValid(date)).toEqual(false)
  })
})

describe('toIsoDate', () => {
  it('ignores null', () => {
    expect(toIsoDate(null)).toEqual(null)
  })
  it('format date', () => {
    expect(toIsoDate(parseIsoDate('2023-01-23'))).toEqual('2023-01-23')
  })
})

describe('cvlDateToDateShort', () => {
  it('format null as not found', () => {
    expect(cvlDateToDateShort(null)).toEqual('not found')
  })
  it('format date', () => {
    expect(cvlDateToDateShort('01/01/2023')).toEqual('1 Jan 2023')
  })
})

describe('parseCvlDate', () => {
  it('ignores null', () => {
    expect(parseCvlDate(null)).toEqual(null)
  })
  it('ignores empty string', () => {
    expect(parseCvlDate('')).toEqual(null)
  })
  it('parses valid date', () => {
    expect(format(parseCvlDate('24/01/2023'), 'yyyy-MM-dd')).toEqual('2023-01-24')
  })
  it('fails to parse invalid date format', () => {
    const date = parseCvlDate('2023-01-23')
    expect(isValid(date)).toEqual(false)
  })
  it('fails to parse invalid date', () => {
    const date = parseCvlDate('invalid date')
    expect(isValid(date)).toEqual(false)
  })
})

describe('parseCvlDateTime', () => {
  it('ignores null', () => {
    expect(parseCvlDateTime(null, { withSeconds: true })).toEqual(null)
    expect(parseCvlDateTime(null, { withSeconds: false })).toEqual(null)
  })
  it('ignores empty string', () => {
    expect(parseCvlDateTime('', { withSeconds: true })).toEqual(null)
    expect(parseCvlDateTime('', { withSeconds: false })).toEqual(null)
  })
  it('parses valid date time', () => {
    {
      const dateTime = parseCvlDateTime('24/01/2023 10:30:45', { withSeconds: true })
      const formatted = format(dateTime, 'yyyy-MM-dd hh:mm:ss')
      expect(formatted).toEqual('2023-01-24 10:30:45')
    }
    {
      const dateTime = parseCvlDateTime('24/01/2023 10:30', { withSeconds: false })
      const formatted = format(dateTime, 'yyyy-MM-dd hh:mm')
      expect(formatted).toEqual('2023-01-24 10:30')
    }
  })
  it('fails to parse invalid date time', () => {
    {
      const date = parseCvlDateTime('2023-01-23', { withSeconds: true })
      expect(isValid(date)).toEqual(false)
    }
    {
      const date = parseCvlDateTime('2023-01-23', { withSeconds: false })
      expect(isValid(date)).toEqual(false)
    }
  })
  it('fails to parse date time with invalid withSeconds spec', () => {
    {
      const dateTime = parseCvlDateTime('23/01/2023 10:30:45', { withSeconds: false })
      expect(isValid(dateTime)).toEqual(false)
    }
    {
      const dateTime = parseCvlDateTime('23/01/2023 10:30', { withSeconds: true })
      expect(isValid(dateTime)).toEqual(false)
    }
  })
  it('fails to parse invalid date', () => {
    {
      const dateTime = parseCvlDateTime('invalid date time', { withSeconds: false })
      expect(isValid(dateTime)).toEqual(false)
    }
    {
      const dateTime = parseCvlDateTime('invalid date time', { withSeconds: true })
      expect(isValid(dateTime)).toEqual(false)
    }
  })
})

describe('Remove duplicates', () => {
  it('should remove duplicates from a list of strings', () => {
    const listWithDuplicates = ['A', 'B', 'C', 'C', 'C']
    expect(removeDuplicates(listWithDuplicates)).toEqual(['A', 'B', 'C'])
  })

  it('should remove duplicates from a more challenging list', () => {
    const listWithDuplicates = ['MDI', 'LEI', 'MDI', 'LEI', 'BMI', 'LEI', 'MDI']
    expect(removeDuplicates(listWithDuplicates)).toEqual(['MDI', 'LEI', 'BMI'])
  })
})

describe('Check empty object', () => {
  it('should return true if value is undefined', () => {
    expect(objectIsEmpty(undefined)).toBe(true)
  })

  it('should return true if value is empty string', () => {
    expect(objectIsEmpty('')).toBe(true)
  })

  it('should return true if value is null', () => {
    expect(objectIsEmpty(null)).toBe(true)
  })

  it('should return true if value is object with empty fields', () => {
    expect(
      objectIsEmpty({
        field1: '',
        field2: null,
        field3: undefined,
      }),
    ).toBe(true)
  })

  it('should return false if value is object with non-empty fields', () => {
    expect(
      objectIsEmpty({
        field1: 'populated',
        field2: null,
        field3: undefined,
      }),
    ).toBe(false)
  })
})

describe('Get max value key', () => {
  it('should return key of the max value', () => {
    const array = [
      { key: 'some key', count: 2 },
      { key: 'another key', count: 5 },
      { key: 'final key', count: 3 },
    ]
    expect(getFirstMaxValueKey(array)).toBe('another key')
  })

  it('should return the first key of the max value if multiple values are the same', () => {
    const array = [
      { key: 'some key', count: 2 },
      { key: 'another key', count: 5 },
      { key: 'final key', count: 5 },
    ]
    expect(getFirstMaxValueKey(array)).toBe('another key')
  })

  it('should return the first key if values all 0', () => {
    const array = [
      { key: 'some key', count: 0 },
      { key: 'another key', count: 0 },
      { key: 'final key', count: 0 },
    ]
    expect(getFirstMaxValueKey(array)).toBe('some key')
  })
})

describe('Check licence is close to release', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2021, 4, 1, 0, 0, 0).getTime()
    })
  })

  it('should return false if LSD is greater than 2 days from now', () => {
    const licence = {
      licenceStartDate: '04/05/2021',
      statusCode: LicenceStatus.APPROVED,
    } as Licence
    expect(licenceIsTwoDaysToRelease(licence)).toBeFalsy()
  })

  it('should return true if LSD is 2 days or less from now', () => {
    const licence = {
      licenceStartDate: '03/05/2021',
      statusCode: LicenceStatus.APPROVED,
    } as Licence
    expect(licenceIsTwoDaysToRelease(licence)).toBeTruthy()
  })
})

describe('groupingBy', () => {
  type Obj = { name: string; age: number }

  it('empty', () => {
    expect(groupingBy([] as Obj[], 'name')).toStrictEqual([])
  })
  it('one', () => {
    expect(groupingBy([{ name: 'bob', age: 100 }], 'name')).toStrictEqual([[{ name: 'bob', age: 100 }]])
  })

  it('many', () => {
    const items = [
      { name: 'bob', age: 100 },
      { name: 'jim', age: 100 },
      { name: 'bob', age: 10 },
    ]

    expect(groupingBy(items, 'name')).toStrictEqual([
      [
        { name: 'bob', age: 100 },
        { name: 'bob', age: 10 },
      ],
      [{ name: 'jim', age: 100 }],
    ])

    expect(groupingBy(items, 'age')).toStrictEqual([
      [{ name: 'bob', age: 10 }],
      [
        { name: 'bob', age: 100 },
        { name: 'jim', age: 100 },
      ],
    ])
  })
})

describe('isInHardStopPeriod', () => {
  let licence: Licence
  beforeEach(() => {
    licence = {
      kind: LicenceKind.CRD,
      isInHardStopPeriod: true,
    } as Licence
  })

  it('returns false if the licence is a variation', () => {
    licence.kind = LicenceKind.VARIATION
    expect(isInHardStopPeriod(licence)).toBe(false)
  })

  it('returns false if the licence is an HDC variation', () => {
    licence.kind = LicenceKind.HDC_VARIATION
    expect(isInHardStopPeriod(licence)).toBe(false)
  })

  it('returns false if the licence is a time served licence', () => {
    licence.kind = LicenceKind.TIME_SERVED
    expect(isInHardStopPeriod(licence)).toBe(false)
  })

  it('returns false if the licence is not in the hard stop period', () => {
    licence = { kind: LicenceKind.CRD, isInHardStopPeriod: false } as Licence
    expect(isInHardStopPeriod(licence)).toBe(false)
  })

  it('returns true for non-variations in the hard stop period when the feature is enabled', () => {
    expect(isInHardStopPeriod(licence)).toBe(true)
  })
})

describe('isVariation', () => {
  it('returns true if isVariation is set to true', () => {
    const licence = { isVariation: true } as Licence
    expect(isVariation(licence)).toBe(true)
  })

  it('returns false if isVariation is set to false', () => {
    const licence = { isVariation: false } as Licence
    expect(isVariation(licence)).toBe(false)
  })
})

describe('isHdcLicence', () => {
  it('returns true if the licence kind is HDC', () => {
    const licence = { kind: LicenceKind.HDC } as Licence
    expect(isHdcLicence(licence)).toBe(true)
  })

  it('returns true if the licence kind is HDC_VARIATION', () => {
    const licence = { kind: LicenceKind.HDC_VARIATION } as Licence
    expect(isHdcLicence(licence)).toBe(true)
  })

  it('returns true if the licence kind is anything else', () => {
    const crdLicence = { kind: LicenceKind.CRD } as Licence
    const variationLicence = { kind: LicenceKind.VARIATION } as Licence
    const hardStopLicence = { kind: LicenceKind.HARD_STOP } as Licence

    expect(isHdcLicence(crdLicence)).toBe(false)
    expect(isHdcLicence(variationLicence)).toBe(false)
    expect(isHdcLicence(hardStopLicence)).toBe(false)
  })
})

describe('  lowercaseFirstLetter', () => {
  it('should lowercase the first character of the message and prepend the prefix', () => {
    expect(lowercaseFirstLetter('Something went wrong')).toBe('something went wrong')
  })

  it('should handle messages that already start with a lowercase letter', () => {
    expect(lowercaseFirstLetter('already lowercase')).toBe('already lowercase')
  })

  it('should handle empty message string', () => {
    expect(lowercaseFirstLetter('')).toBe('')
  })

  it('should handle single character message', () => {
    expect(lowercaseFirstLetter('X')).toBe('x')
  })
})

describe('escapeCsv', () => {
  it('returns empty string if value is null', () => {
    // Given
    const value: string = null

    // When
    const result = escapeCsv(value)

    // Then
    expect(result).toBe('')
  })

  it('returns empty string if value is undefined', () => {
    // Given
    const value: string = undefined

    // When
    const result = escapeCsv(value)

    // Then
    expect(result).toBe('')
  })

  it('returns the same string if no special characters are present', () => {
    // Given
    const value = 'hello'

    // When
    const result = escapeCsv(value)

    // Then
    expect(result).toBe('hello')
  })

  it('escapes quotes by doubling them', () => {
    // Given
    const value = 'he said "hi"'

    // When
    const result = escapeCsv(value)

    // Then
    expect(result).toBe('"he said ""hi"""')
  })

  it('wraps value in quotes if it contains a comma', () => {
    // Given
    const value = 'hello,world'

    // When
    const result = escapeCsv(value)

    // Then
    expect(result).toBe('"hello,world"')
  })

  it('wraps value in quotes if it contains a newline', () => {
    // Given
    const value = 'hello\nworld'

    // When
    const result = escapeCsv(value)

    // Then
    expect(result).toBe('"hello\nworld"')
  })
})

describe('isTimeServedLicence', () => {
  it('returns true when the licence kind is TIME_SERVED', () => {
    const licence = { kind: LicenceKind.TIME_SERVED } as Licence
    expect(isTimeServedLicence(licence)).toBe(true)
  })

  it('returns false when the licence kind is not TIME_SERVED', () => {
    const licence = { kind: LicenceKind.CRD } as Licence
    expect(isTimeServedLicence(licence)).toBe(false)
  })
}
    
describe('mapToTargetField', () => {
  it('should map filename to the target field', () => {
    const input = {
      filename: 'doc.pdf',
      fileTargetField: 'outOfBoundFilename',
    }

    const output = mapToTargetField(input)

    expect(output).toEqual({
      outOfBoundFilename: 'doc.pdf',
    })
  })

  it('should preserve additional fields', () => {
    const input = {
      eventName: 'Event123',
      filename: 'photo.png',
      fileTargetField: 'inBoundFilename',
      extra: 'abc',
    }

    const output = mapToTargetField(input)

    expect(output).toEqual({
      eventName: 'Event123',
      extra: 'abc',
      inBoundFilename: 'photo.png',
    })
  })

  it('should allow dynamic field names', () => {
    const input = {
      filename: 'file.txt',
      fileTargetField: 'customFieldName',
    }

    const output = mapToTargetField(input)

    expect(output).toEqual({
      customFieldName: 'file.txt',
    })
  })

  it('should remove filename and fileTargetField from the output', () => {
    const input = {
      filename: 'abc.jpg',
      fileTargetField: 'outOfBoundFilename',
      something: 123,
    }

    const output = mapToTargetField(input)

    expect(output.filename).toBeUndefined()
    expect(output.fileTargetField).toBeUndefined()
    expect(output.something).toBe(123)
    expect(output.outOfBoundFilename).toBe('abc.jpg')
  })

  it('should work even with deeply nested unrelated fields', () => {
    const input = {
      filename: 'nested.doc',
      fileTargetField: 'outOfBoundFilename',
      nested: { a: 1, b: { c: 2 } },
    }

    const output = mapToTargetField(input)

    expect(output).toEqual({
      nested: { a: 1, b: { c: 2 } },
      outOfBoundFilename: 'nested.doc',
    })
  })
})
