import { isDefined } from 'class-validator'
import moment from 'moment'
import { addDays, format } from 'date-fns'
import {
  addressObjectToString,
  convertDateFormat,
  convertToTitleCase,
  hasRole,
  jsonToSimpleDateTime,
  simpleDateTimeToJson,
  stringToAddressObject,
  jsonDtTo12HourTime,
  jsonDtToDate,
  toDate,
  toDateString,
  removeDuplicates,
  filterCentralCaseload,
  jsonDtToDateWithDay,
  objectIsEmpty,
  hasAuthSource,
  isBankHolidayOrWeekend,
  licenceIsTwoDaysToRelease,
  selectReleaseDate,
  isPassedArdOrCrd,
  selectReleaseDateFromLicence,
  releaseDateLabel,
} from './utils'
import AuthRole from '../enumeration/authRole'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'
import SimpleDate from '../routes/creatingLicences/types/date'
import SimpleDateTime from '../routes/creatingLicences/types/simpleDateTime'
import Address from '../routes/creatingLicences/types/address'
import { Licence, LicenceSummary } from '../@types/licenceApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'

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

describe('Convert date format', () => {
  it('should return YYYY-MM-DD date in format DD/MM/YYYY', () => {
    const date = '2015-04-26'
    expect(convertDateFormat(date)).toEqual('26/04/2015')
  })
})

describe('Create date from string', () => {
  it('should return date object', () => {
    const dateString = '25/12/2022'
    expect(toDate(dateString)).toStrictEqual(new Date('2022-12-25'))
  })
})

describe('toDateString', () => {
  it('converts a data from dd/mm/yyyy format to yyyy-mm-dd format', () => {
    const dateString = '25/12/2022'
    expect(toDateString(dateString)).toEqual('2022-12-25')
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
  jsonDateTime          | dateFull
  ${'12/12/2021 23:15'} | ${'12th December 2021'}
  ${'31/01/2022 12:01'} | ${'31st January 2022'}
  ${'31/12/2022 12:00'} | ${'31st December 2022'}
  ${'31/12/2022 00:00'} | ${'31st December 2022'}
  ${'01/01/2022 01:01'} | ${'1st January 2022'}
  ${'22/10/2024 14:23'} | ${'22nd October 2024'}
  ${'22/10/24 14:23'}   | ${'22nd October 2024'}
  ${'22/10/24'}         | ${'22nd October 2024'}
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
  ${'12/12/2021 23:15'} | ${'Sunday 12th December 2021'}
  ${'31/01/2022 12:01'} | ${'Monday 31st January 2022'}
  ${'31/12/2022 12:00'} | ${'Saturday 31st December 2022'}
  ${'null'}             | ${'null'}
`('convert JSON datetime to date with full day', ({ jsonDateTime, dateFull }) => {
  const dateValue = jsonDtToDateWithDay(jsonDateTime)
  if (isDefined(dateValue)) {
    expect(dateValue).toEqual(dateFull)
  } else {
    expect(dateValue).toBeNull()
  }
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

describe('Filter central case load', () => {
  it('should remove central caseload CADM*', () => {
    const withCentralCaseoad = ['A', 'B', 'CADM_I', 'D', 'E']
    expect(filterCentralCaseload(withCentralCaseoad)).toEqual(['A', 'B', 'D', 'E'])
  })

  it('should return an empty list', () => {
    const onlyCentralCaseload = ['CADM_I']
    expect(filterCentralCaseload(onlyCentralCaseload)).toHaveLength(0)
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
      })
    ).toBe(true)
  })

  it('should return false if value is object with non-empty fields', () => {
    expect(
      objectIsEmpty({
        field1: 'populated',
        field2: null,
        field3: undefined,
      })
    ).toBe(false)
  })
})

describe('Check bank holiday or weekend', () => {
  it('should return false if date is a Friday', () => {
    expect(isBankHolidayOrWeekend(moment('2022-05-13'), [])).toBe(false)
  })

  it('should return true if date is a Saturday', () => {
    expect(isBankHolidayOrWeekend(moment('2022-05-14'), [])).toBe(true)
  })

  it('should return true if date is a Sunday', () => {
    expect(isBankHolidayOrWeekend(moment('2022-05-15'), [])).toBe(true)
  })

  it('should return true if date is a Monday', () => {
    expect(isBankHolidayOrWeekend(moment('2022-05-16'), [])).toBe(false)
  })

  it('should return true if date is in list of holidays', () => {
    expect(
      isBankHolidayOrWeekend(moment('2022-05-16'), [
        {
          title: 'Test holiday',
          date: '2022-05-16',
        },
      ])
    ).toBe(true)
  })
})

describe('Check licence is close to release', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2021, 4, 1, 0, 0, 0).getTime()
    })
  })

  it('should return false if CRD is greater than 2 days from now', () => {
    const licence = {
      conditionalReleaseDate: '04/05/2021',
      statusCode: LicenceStatus.APPROVED,
    } as Licence
    expect(licenceIsTwoDaysToRelease(licence)).toBeFalsy()
  })

  it('should return true if CRD is 2 days or less from now', () => {
    const licence = {
      conditionalReleaseDate: '03/05/2021',
      statusCode: LicenceStatus.APPROVED,
    } as Licence
    expect(licenceIsTwoDaysToRelease(licence)).toBeTruthy()
  })
})

describe('Get prisoner release date from Nomis', () => {
  it('No date returns "not found', () => {
    const nomisRecord = {
      conditionalReleaseDate: null,
    } as Prisoner

    expect(selectReleaseDate(nomisRecord)).toBe('not found')
  })

  it('Release date should be Conditional Release Date 22 Nov 2035', () => {
    const nomisRecord = {
      conditionalReleaseDate: '2035-11-22',
    } as Prisoner

    expect(selectReleaseDate(nomisRecord)).toBe('22 Nov 2035')
  })

  it('Release date should be Confirmed Release Date 22 Oct 2035', () => {
    const nomisRecord = {
      conditionalReleaseDate: '2035-11-22',
      confirmedReleaseDate: '2035-10-22',
    } as Prisoner

    expect(selectReleaseDate(nomisRecord)).toBe('22 Oct 2035')
  })

  it('Release date should be Conditional Release Override Date 22 Nov 2036', () => {
    const nomisRecord = {
      conditionalReleaseDate: '2036-11-01',
      conditionalReleaseOverrideDate: '2036-11-22',
    } as Prisoner

    expect(selectReleaseDate(nomisRecord)).toBe('22 Nov 2036')
  })

  it('Returns malformed date as is', () => {
    const nomisRecord = {
      conditionalReleaseDate: 'aaa2036-11-01',
    } as Prisoner

    expect(selectReleaseDate(nomisRecord)).toBe('aaa2036-11-01')
  })
})

describe('Get prisoner release date from Licence', () => {
  it('No date returns "not found', () => {
    const licence = {
      conditionalReleaseDate: null,
    } as Licence

    expect(selectReleaseDateFromLicence(licence)).toBe('not found')
  })

  it('Release date should be Conditional Release Date 22 Nov 2035', () => {
    const licence = {
      conditionalReleaseDate: '22/11/2035',
    } as Licence

    expect(selectReleaseDateFromLicence(licence)).toBe('22 Nov 2035')
  })

  it('Release date should be Confirmed Release Date 22 Oct 2035', () => {
    const licence = {
      conditionalReleaseDate: '22/11/2035',
      actualReleaseDate: '22/10/2035',
    } as unknown as Licence

    expect(selectReleaseDateFromLicence(licence)).toBe('22 Oct 2035')
  })

  it('Returns malformed date as is', () => {
    const licence = {
      conditionalReleaseDate: 'aaa01/11/2036',
    } as Licence

    expect(selectReleaseDateFromLicence(licence)).toBe('2036-11-aaa01')
  })
})

describe('isPassedArdOrCrd', () => {
  it('Should return true when legal status is NOT immigration and actualReleaseDate is yesterday', () => {
    const licence = {
      actualReleaseDate: format(addDays(new Date(), -1), 'dd/MM/yyyy'),
      conditionalReleaseDate: format(addDays(new Date(), 5), 'dd/MM/yyyy'),
    } as LicenceSummary

    const prisoner = { legalStatus: 'SENTENCED' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(true)
  })

  it('Should return true when legal status is NOT immigration and actualReleaseDate is today', () => {
    const licence = {
      actualReleaseDate: format(new Date(), 'dd/MM/yyyy'),
      conditionalReleaseDate: format(addDays(new Date(), 5), 'dd/MM/yyyy'),
    } as LicenceSummary

    const prisoner = { legalStatus: 'SENTENCED' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(true)
  })

  it('Should return false when legal status is NOT immigration and actualReleaseDate is tomorrow', () => {
    const licence = {
      actualReleaseDate: format(addDays(new Date(), 1), 'dd/MM/yyyy'),
      conditionalReleaseDate: format(addDays(new Date(), 5), 'dd/MM/yyyy'),
    } as LicenceSummary

    const prisoner = { legalStatus: 'SENTENCED' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(false)
  })

  it('Should return true when legal status is immigration and conditionalReleaseDate is today', () => {
    const licence = {
      actualReleaseDate: undefined,
      conditionalReleaseDate: format(new Date(), 'dd/MM/yyyy'),
    } as LicenceSummary

    const prisoner = { legalStatus: 'IMMIGRATION_DETAINEE' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(true)
  })

  it('Should return false when legal status is immigration and conditionalReleaseDate is tomorrow', () => {
    const licence = {
      actualReleaseDate: undefined,
      conditionalReleaseDate: format(addDays(new Date(), 1), 'dd/MM/yyyy'),
    } as LicenceSummary

    const prisoner = { legalStatus: 'IMMIGRATION_DETAINEE' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(false)
  })

  it('Should return true when legal status is immigration and actualReleaseDate is present and in the past', () => {
    const licence = {
      actualReleaseDate: format(new Date(), 'dd/MM/yyyy'),
      conditionalReleaseDate: format(addDays(new Date(), 1), 'dd/MM/yyyy'),
    } as LicenceSummary

    const prisoner = { legalStatus: 'IMMIGRATION_DETAINEE' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(true)
  })

  it('Should return false when legal status is immigration and actualReleaseDate is present and in the future', () => {
    const licence = {
      actualReleaseDate: format(addDays(new Date(), 1), 'dd/MM/yyyy'),
      conditionalReleaseDate: format(new Date(), 'dd/MM/yyyy'),
    } as LicenceSummary

    const prisoner = { legalStatus: 'IMMIGRATION_DETAINEE' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(false)
  })

  it('Should return false when legal status is immigration and no dates are present', () => {
    const licence = {
      actualReleaseDate: undefined,
      conditionalReleaseDate: undefined,
    } as LicenceSummary

    const prisoner = { legalStatus: 'IMMIGRATION_DETAINEE' } as Prisoner

    expect(isPassedArdOrCrd(licence, prisoner)).toBe(false)
  })
})

describe('releaseDateLabel', () => {
  it('returns "CRD" if the release date from NOMIS is a CRD', () => {
    const nomisRecord = {
      conditionalReleaseDate: '2035-11-22',
    } as Prisoner

    expect(releaseDateLabel(null, nomisRecord)).toBe('CRD')
  })

  it('returns "Confirmed release date" if the release date from NOMIS is a confirmed release date', () => {
    const nomisRecord = {
      confirmedReleaseDate: '2035-10-22',
    } as Prisoner

    expect(releaseDateLabel(null, nomisRecord)).toBe('Confirmed release date')
  })

  it('returns "CRD" if the release date from the licence is a CRD, regardless of NOMIS record', () => {
    const licence = {
      conditionalReleaseDate: '2035-11-22',
    } as unknown as Licence

    const nomisRecord = {
      conditionalReleaseDate: '2022-1-3',
      confirmedReleaseDate: '2022-1-1',
    } as Prisoner

    expect(releaseDateLabel(licence, nomisRecord)).toBe('CRD')
  })

  it('returns "Confirmed release date" if the release date from the licence is an ARD, regardless of the NOMIS record', () => {
    const licence = {
      conditionalReleaseDate: '2035-11-22',
      actualReleaseDate: '2035-11-24',
    } as unknown as Licence

    const nomisRecord = {
      conditionalReleaseDate: '2022-1-3',
      confirmedReleaseDate: '2022-1-1',
    } as Prisoner

    expect(releaseDateLabel(licence, nomisRecord)).toBe('Confirmed release date')
  })
})
