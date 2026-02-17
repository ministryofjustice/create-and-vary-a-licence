import { format, addDays, subDays, addMonths } from 'date-fns'
import { FoundComCase, Licence } from '../@types/licenceApiClientTypes'
import { renderTemplate } from './__testutils/templateTestUtils'
import { registerNunjucks } from './nunjucksSetup'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceKind from '../enumeration/LicenceKind'

describe('Nunjucks Filters', () => {
  describe('initialiseName', () => {
    it('should return null if full name is not provided', () => {
      const $ = renderTemplate('{{ fullName | initialiseName }}', {})
      expect($('body').text()).toBe('')
    })

    it('should return formatted name', () => {
      const $ = renderTemplate('{{ fullName | initialiseName }}', { fullName: 'Joe Bloggs' })
      expect($('body').text()).toBe('J. Bloggs')
    })
  })

  describe('concatValues', () => {
    it('should return null if object is not provided', () => {
      const $ = renderTemplate('{{ testObject | concatValues }}', { fullName: 'Joe Bloggs' })
      expect($('body').text()).toBe('')
    })

    it('should return concatenated object values', () => {
      const $ = renderTemplate('{{ testObject | concatValues }}', {
        testObject: { data1: 'test1', data2: 'test2', data3: 'test3' },
      })
      expect($('body').text()).toBe('test1, test2, test3')
    })
  })

  describe('errorSummaryList', () => {
    it('should map errors to text and href', () => {
      const template = `
        {% set errorSummaryList = errors | errorSummaryList %}
        {% for error in errorSummaryList %}
            <a href="{{ errorSummaryList[loop.index0].href }}">{{ errorSummaryList[loop.index0].text }}</a>
        {% endfor %}
      `
      const $ = renderTemplate(template, {
        errors: [
          {
            field: 'field1',
            summaryMessage: 'message1',
          },
          {
            field: 'field2',
            summaryMessage: 'message2',
          },
        ],
      })

      expect($('a:nth-child(1)').text()).toBe('message1')
      expect($('a:nth-child(1)').attr('href')).toBe('#field1')
      expect($('a:nth-child(2)').text()).toBe('message2')
      expect($('a:nth-child(2)').attr('href')).toBe('#field2')
    })

    it('should use message for error message if summaryMessage not defined', () => {
      const template = `
        {% set errorSummaryList = errors | errorSummaryList %}
        {% for error in errorSummaryList %}
            <a href="{{ errorSummaryList[loop.index0].href }}">{{ errorSummaryList[loop.index0].text }}</a>
        {% endfor %}
      `
      const $ = renderTemplate(template, {
        errors: [
          {
            field: 'field1',
            message: 'message1',
          },
          {
            field: 'field2',
            message: 'message2',
          },
        ],
      })

      expect($('a:nth-child(1)').text()).toBe('message1')
      expect($('a:nth-child(1)').attr('href')).toBe('#field1')
      expect($('a:nth-child(2)').text()).toBe('message2')
      expect($('a:nth-child(2)').attr('href')).toBe('#field2')
    })
  })

  describe('findError', () => {
    it('should find error from list of errors where field matches given value', () => {
      const template = `
        <div>{{ (errors | findError('field1')).text }}</div>
      `

      const $ = renderTemplate(template, {
        errors: [
          {
            field: 'field1',
            message: 'message1',
          },
          {
            field: 'field2',
            message: 'message2',
          },
        ],
      })

      expect($('div').text()).toBe('message1')
    })
  })

  describe('fillFormResponse', () => {
    it('should return the override value if not undefined', () => {
      const template = `
        <div>{{ (defaultValue | fillFormResponse(overrideValue)) }}</div>
      `

      const $ = renderTemplate(template, {
        defaultValue: 'default',
        overrideValue: 'override',
      })

      expect($('div').text()).toBe('override')
    })

    it('should return the default value if override is undefined', () => {
      const template = `
        <div>{{ (defaultValue | fillFormResponse(overrideValue)) }}</div>
      `
      const $ = renderTemplate(template, {
        defaultValue: 'default',
        overrideValue: undefined,
      })

      expect($('div').text()).toBe('default')
    })
  })

  describe('Format addresses', () => {
    it('should remove blank address lines and return comma-separated string', () => {
      const template = '{{ address | formatAddress }}'

      const $ = renderTemplate(template, {
        address: '12, Peel Street, , , Grangemouth, Lancashire, GM12 84L',
      })

      expect($('body').text()).toBe('12, Peel Street, Grangemouth, Lancashire, GM12 84L')
    })

    it('should remove blank address lines and return a list of strings (no spaces)', () => {
      const template = '{{ address | formatAddressAsList }}'
      const $ = renderTemplate(template, {
        address: '12, Peel Street, , , Grangemouth, Lancashire, GM12 84L',
      })
      expect($('body').text()).toBe('12,Peel Street,Grangemouth,Lancashire,GM12 84L')
    })

    it('should remove blank address lines and return a list of strings (no spaces)', () => {
      const template = '{{ address | formatLicenceAddressAsList }}'
      const $ = renderTemplate(template, {
        address: {
          reference: '123',
          firstLine: '12',
          secondLine: 'Peel Street',
          townOrCity: 'Grangemouth',
          county: 'Lancashire',
          postcode: 'GM12 84L',
          source: 'MANUAL',
        },
      })
      expect($('body').text()).toBe('12,Peel Street,Grangemouth,Lancashire,GM12 84L')
    })
  })

  describe('Format list as string', () => {
    it('should render a list as a string', () => {
      const template = '{{ roleList | formatListAsString | safe }}'
      const $ = renderTemplate(template, {
        roleList: ['ROLE_A', 'ROLE_B', 'ROLE_C'],
      })
      expect($('body').text()).toBe("['ROLE_A','ROLE_B','ROLE_C']")
    })

    it('should render an empty list as a string', () => {
      const template = '{{ roleList | formatListAsString | safe }}'
      const $ = renderTemplate(template, {
        roleList: [],
      })
      expect($('body').text()).toBe('[]')
    })

    it('should render a null list as a string', () => {
      const template = '{{ roleList | formatListAsString | safe }}'
      const $ = renderTemplate(template, {})
      expect($('body').text()).toBe('[]')
    })
  })

  describe('Format dates and times', () => {
    it('should format a date and time', () => {
      const template = '{{ testDateTime | datetimeToDate }}'
      const $ = renderTemplate(template, {
        testDateTime: '23/12/2021 11:15',
      })
      expect($('body').text()).toBe('23 December 2021')
    })

    it('should format a date and time with full day', () => {
      const template = '{{ testDateTime | datetimeToDateWithDay }}'
      const $ = renderTemplate(template, { testDateTime: '23/12/2021 11:15' })
      expect($('body').text()).toBe('Thursday 23 December 2021')
    })

    it('should format a date and time to a 12-hour time', () => {
      const template = '{{ testDateTime | datetimeTo12HourTime }}'
      const $ = renderTemplate(template, {
        testDateTime: '23/12/2021 21:15',
      })
      expect($('body').text()).toBe('09:15 pm')
    })
  })

  describe('Should select a checkbox', () => {
    it('toChecked', () => {
      const model = [
        { desc: 'car', code: 'CAR' },
        { desc: 'bus', code: 'BUS' },
        { desc: 'boat', code: 'BOAT' },
      ]

      const result = registerNunjucks().getFilter('toChecked')(model, 'code', 'desc', ['CAR', 'BOAT'])

      expect(result).toEqual([
        {
          checked: true,
          text: 'car',
          value: 'CAR',
        },
        {
          checked: false,
          text: 'bus',
          value: 'BUS',
        },
        {
          checked: true,
          text: 'boat',
          value: 'BOAT',
        },
      ])
    })
  })

  describe('addQueryParam', () => {
    it('does not add param when value undefined', () => {
      const result = registerNunjucks().getFilter('addQueryParam')('/some-funky/path', 'query', undefined)
      expect(result).toEqual('/some-funky/path')
    })

    it('does not add param when value is false', () => {
      const result = registerNunjucks().getFilter('addQueryParam')('/some-funky/path', 'query', false)
      expect(result).toEqual('/some-funky/path?query=false')
    })

    it('adds param when present and no existing query params', () => {
      const result = registerNunjucks().getFilter('addQueryParam')('/some-funky/path', 'query', 'some-string')
      expect(result).toEqual('/some-funky/path?query=some-string')
    })

    it('adds param when present and query params exist', () => {
      const result = registerNunjucks().getFilter('addQueryParam')(
        '/some-funky/path?query=some-string',
        'another-query',
        'some-other-string',
      )
      expect(result).toEqual('/some-funky/path?query=some-string&another-query=some-other-string')
    })

    it('both name and value are encoded properly', () => {
      const result = registerNunjucks().getFilter('addQueryParam')('/some-funky/path', 'some&query', 'some?string')
      expect(result).toEqual('/some-funky/path?some%26query=some%3Fstring')
    })
  })

  describe('Extract specified value from object array', () => {
    it('extractAttr', () => {
      const model = [
        { id: 'a', description: 'Letter A' },
        { id: 'b', description: 'Letter B' },
        { id: 'c', description: 'Letter C' },
      ]

      const result = registerNunjucks().getFilter('extractAttr')(model, 'description')

      expect(result).toEqual(['Letter A', 'Letter B', 'Letter C'])
    })
  })

  describe('dateToDisplay', () => {
    it('Should handle AP licence with led', () => {
      const licence = { typeCode: 'AP', licenceExpiryDate: '17/12/2022' } as Licence
      const result = registerNunjucks().getFilter('dateToDisplay')(licence)
      expect(result).toEqual('Licence end date: 17 December 2022')
    })
    it('Should handle AP licence without led', () => {
      const licence = { typeCode: 'AP', licenceExpiryDate: undefined } as Licence
      const result = registerNunjucks().getFilter('dateToDisplay')(licence)
      expect(result).toEqual('Licence end date: Not available')
    })

    it('Should handle AP_PSS where tussd is not today', () => {
      const tomorrow = format(addDays(new Date(), 1), 'd/MM/yyyy')
      const licenceExpiryDate = '12/12/2022'
      const licence = { typeCode: 'AP_PSS', topupSupervisionStartDate: tomorrow, licenceExpiryDate } as Licence
      const result = registerNunjucks().getFilter('dateToDisplay')(licence)
      expect(result).toEqual('Licence end date: 12 December 2022')
    })

    it('Should handle AP_PSS where tussd is today', () => {
      const today = format(new Date(), 'd/MM/yyyy')
      const tused = format(addMonths(new Date(), 1), 'd/MM/yyyy')
      const tusedInLongerForm = format(addMonths(new Date(), 1), 'd MMMM yyy')
      const licence = {
        typeCode: 'AP_PSS',
        topupSupervisionStartDate: today,
        topupSupervisionExpiryDate: tused,
      } as Licence
      const result = registerNunjucks().getFilter('dateToDisplay')(licence)
      expect(result).toEqual(`PSS end date: ${tusedInLongerForm}`)
    })

    it('Should handle AP_PSS where led has passed and tused exists but no tussd', () => {
      const yesterday = format(subDays(new Date(), 1), 'd/MM/yyyy')
      const tused = format(addMonths(new Date(), 1), 'd/MM/yyyy')
      const tusedInLongerForm = format(addMonths(new Date(), 1), 'd MMMM yyy')
      const licence = {
        typeCode: 'AP_PSS',
        licenceExpiryDate: yesterday,
        topupSupervisionExpiryDate: tused,
      } as Licence
      const result = registerNunjucks().getFilter('dateToDisplay')(licence)
      expect(result).toEqual(`PSS end date: ${tusedInLongerForm}`)
    })

    it('Should handle PSS licence', () => {
      const licence = { typeCode: 'PSS', topupSupervisionExpiryDate: '13/12/2022' } as Licence
      const result = registerNunjucks().getFilter('dateToDisplay')(licence)
      expect(result).toEqual('PSS end date: 13 December 2022')
    })
  })

  describe('titleCaseWord', () => {
    it('should convert first character to Caps', () => {
      expect(registerNunjucks().getFilter('titlecase')('IMMIGRATION DETAINEE')).toEqual('Immigration detainee')
      expect(registerNunjucks().getFilter('titlecase')('sENTENCED')).toEqual('Sentenced')
    })
  })

  describe('getlicenceStatusForSearchResults', () => {
    it('should return REVIEW_NEEDED status', () => {
      expect(
        registerNunjucks().getFilter('getlicenceStatusForSearchResults')({
          isReviewNeeded: true,
          licenceStatus: LicenceStatus.ACTIVE,
        } as FoundComCase),
      ).toEqual(LicenceStatus.REVIEW_NEEDED)
    })

    it('should return TIMED_OUT status', () => {
      expect(
        registerNunjucks().getFilter('getlicenceStatusForSearchResults')({
          isReviewNeeded: false,
          kind: LicenceKind.HARD_STOP,
          licenceStatus: LicenceStatus.SUBMITTED,
        } as FoundComCase),
      ).toEqual(LicenceStatus.TIMED_OUT)
    })

    it('should return TIMED_OUT status for TIME_SERVED', () => {
      expect(
        registerNunjucks().getFilter('getlicenceStatusForSearchResults')({
          isReviewNeeded: false,
          kind: LicenceKind.TIME_SERVED,
          licenceStatus: LicenceStatus.SUBMITTED,
        } as FoundComCase),
      ).toEqual(LicenceStatus.TIMED_OUT)
    })

    it('should return the same status as licence status', () => {
      expect(
        registerNunjucks().getFilter('getlicenceStatusForSearchResults')({
          isReviewNeeded: false,
          kind: LicenceKind.CRD,
          licenceStatus: LicenceStatus.SUBMITTED,
        } as FoundComCase),
      ).toEqual(LicenceStatus.SUBMITTED)
    })

    it('should return RESTRICTED status', () => {
      expect(
        registerNunjucks().getFilter('getlicenceStatusForSearchResults')({
          isLao: true,
          licenceStatus: LicenceStatus.ACTIVE,
        } as FoundComCase),
      ).toEqual(LicenceStatus.RESTRICTED)
    })
  })

  describe('cvlDateToDateShort', () => {
    it('should return not found string', () => {
      expect(registerNunjucks().getFilter('cvlDateToDateShort')('')).toEqual('not found')
    })

    it('should return d MMM yyyy date format', () => {
      expect(registerNunjucks().getFilter('cvlDateToDateShort')('01/04/2024')).toEqual('1 Apr 2024')
    })
  })

  describe('createOffenderLink', () => {
    it('returns licence-changes-not-approved-in-time when TIMED_OUT and versionOf exists', () => {
      // Given
      const foundComCase = {
        licenceId: 1,
        licenceStatus: LicenceStatus.TIMED_OUT,
        kind: LicenceKind.CRD,
        versionOf: 99,
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/id/1/licence-changes-not-approved-in-time')
    })

    it('returns prison-will-create-this-licence when TIMED_OUT and versionOf does NOT exist', () => {
      // Given
      const foundComCase = {
        licenceId: 1,
        licenceStatus: LicenceStatus.TIMED_OUT,
        kind: LicenceKind.CRD,
        nomisId: 'A1234BC',
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
    })

    it('returns prison-will-create-this-licence when HARD_STOP and IN_PROGRESS', () => {
      // Given
      const foundComCase = {
        licenceId: 2,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        kind: LicenceKind.HARD_STOP,
        nomisId: 'A1234BC',
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
    })

    it('returns prison-will-create-this-licence when TIME_SERVED and IN_PROGRESS', () => {
      // Given
      const foundComCase = {
        licenceId: 3,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        kind: LicenceKind.TIME_SERVED,
        nomisId: 'B2345CD',
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/nomisId/B2345CD/prison-will-create-this-licence')
    })

    it('returns licence-created-by-prison when HARD_STOP and NOT IN_PROGRESS', () => {
      // Given
      const foundComCase = {
        licenceId: 4,
        licenceStatus: LicenceStatus.ACTIVE,
        kind: LicenceKind.HARD_STOP,
        nomisId: 'C3456DE',
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/id/4/licence-created-by-prison')
    })

    it('returns licence-created-by-prison when TIME_SERVED and NOT IN_PROGRESS', () => {
      // Given
      const foundComCase = {
        licenceId: 5,
        licenceStatus: LicenceStatus.SUBMITTED,
        kind: LicenceKind.TIME_SERVED,
        nomisId: 'D4567EF',
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/id/5/licence-created-by-prison')
    })

    it('returns confirm page when licenceId is missing', () => {
      // Given
      const foundComCase = {
        licenceId: null,
        licenceStatus: LicenceStatus.NOT_STARTED,
        kind: LicenceKind.CRD,
        nomisId: 'E5678FG',
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/nomisId/E5678FG/confirm')
    })

    it('returns check-your-answers page when none of the special cases apply', () => {
      // Given
      const foundComCase = {
        licenceId: 6,
        licenceStatus: LicenceStatus.SUBMITTED,
        kind: LicenceKind.CRD,
        nomisId: 'F6789GH',
      } as FoundComCase

      // When
      const result = registerNunjucks().getFilter('createOffenderLink')(foundComCase)

      // Then
      expect(result).toBe('/licence/create/id/6/check-your-answers')
    })
  })

  describe('legalStatus', () => {
    it('should return Recall', () => {
      expect(registerNunjucks().getFilter('titlecase')(registerNunjucks().getFilter('legalStatus')('RECALL'))).toEqual(
        'Recall',
      )
    })

    it('should return Indeterminate Sentence', () => {
      expect(
        registerNunjucks().getFilter('titlecase')(
          registerNunjucks().getFilter('legalStatus')('INDETERMINATE_SENTENCE'),
        ),
      ).toEqual('Indeterminate sentence')
    })

    it('should return Immigration Detainee', () => {
      expect(
        registerNunjucks().getFilter('titlecase')(registerNunjucks().getFilter('legalStatus')('IMMIGRATION_DETAINEE')),
      ).toEqual('Immigration detainee')
    })
  })

  describe('shouldShowHardStopWarning', () => {
    const now = new Date()

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should return true if now is between the warning and hard stop dates', () => {
      const licence = {
        kind: LicenceKind.CRD,
        hardStopWarningDate: format(subDays(now, 1), 'dd/MM/yyyy'),
        hardStopDate: format(addDays(now, 1), 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(true)
    })

    it('should return true if now is equal to the warning date', () => {
      const licence = {
        kind: LicenceKind.CRD,
        hardStopWarningDate: format(now, 'dd/MM/yyyy'),
        hardStopDate: format(addDays(now, 2), 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(true)
    })

    it('should return false if now is equal to the hardstop date', () => {
      const licence = {
        kind: LicenceKind.CRD,
        hardStopWarningDate: format(subDays(now, 2), 'dd/MM/yyyy'),
        hardStopDate: format(now, 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(false)
    })

    it('should return false if now is before window', () => {
      const licence = {
        kind: LicenceKind.CRD,
        hardStopWarningDate: format(addDays(now, 1), 'dd/MM/yyyy'),
        hardStopDate: format(addDays(now, 3), 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(false)
    })

    it('should return false if the now is after window', () => {
      const licence = {
        kind: LicenceKind.CRD,
        hardStopWarningDate: format(subDays(now, 3), 'dd/MM/yyyy'),
        hardStopDate: format(subDays(now, 1), 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(false)
    })

    it('should return false if kind is VARTATION', () => {
      const licence = {
        kind: LicenceKind.VARIATION,
        hardStopWarningDate: format(now, 'dd/MM/yyyy'),
        hardStopDate: format(addDays(now, 2), 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(false)
    })

    it('should return true if now is between the warning and hard stop dates with null kind', () => {
      const licence = {
        kind: null as LicenceKind,
        hardStopWarningDate: format(subDays(now, 1), 'dd/MM/yyyy'),
        hardStopDate: format(addDays(now, 1), 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(true)
    })

    it('should return false if hardStopWarningDate is null', () => {
      const licence = {
        kind: LicenceKind.CRD,
        hardStopWarningDate: '',
        hardStopDate: format(addDays(now, 1), 'dd/MM/yyyy'),
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(false)
    })

    it('should return false if hardStopDate is null', () => {
      const licence = {
        kind: LicenceKind.CRD,
        hardStopWarningDate: format(subDays(now, 1), 'dd/MM/yyyy'),
        hardStopDate: '',
      }

      expect(registerNunjucks().getFilter('shouldShowHardStopWarning')(licence)).toEqual(false)
    })
  })

  describe('formatAddressTitleCase multiple addresses', () => {
    it('formats a full address correctly', () => {
      const address = {
        firstLine: '1 PRUNUS WALK',
        secondLine: 'FLAT 2b',
        townOrCity: 'SWINDON',
        postcode: 'HN5 8UH',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, true)).toBe(
        '1 Prunus Walk, Flat 2B, Swindon, HN5 8UH',
      )
    })

    it('handles missing secondLine', () => {
      const address = {
        firstLine: '1 PRUNUS WALK',
        secondLine: '',
        townOrCity: 'SWINDON',
        postcode: 'HN5 8UH',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, true)).toBe(
        '1 Prunus Walk, Swindon, HN5 8UH',
      )
    })

    it('preserves postcode casing', () => {
      const address = {
        firstLine: 'flat 3b',
        secondLine: '',
        townOrCity: 'london',
        postcode: 'e1 6an',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, true)).toBe('Flat 3B, London, e1 6an')
    })

    it('handles apostrophes correctly', () => {
      const address = {
        firstLine: "emilia's house",
        secondLine: '',
        townOrCity: "swindon's end",
        postcode: 'HN5 8UH',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, true)).toBe(
        "Emilia's House, Swindon's End, HN5 8UH",
      )
    })

    it('returns empty string for null address', () => {
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(null)).toBe('')
    })

    it('trims whitespace from parts', () => {
      const address = {
        firstLine: ' 10 downing street ',
        secondLine: ' ',
        townOrCity: ' london ',
        postcode: ' SW1A 2AA ',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, true)).toBe(
        '10 Downing Street, London, SW1A 2AA',
      )
    })
  })

  describe('formatAddressTitleCase single address', () => {
    it('formats a full address correctly', () => {
      const address = {
        firstLine: '1 PRUNUS WALK',
        secondLine: 'FLAT 2b',
        townOrCity: 'SWINDON',
        postcode: 'HN5 8UH',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, false)).toBe(
        '1 Prunus Walk<br>Flat 2B<br>Swindon<br>HN5 8UH',
      )
    })

    it('handles missing secondLine', () => {
      const address = {
        firstLine: '1 PRUNUS WALK',
        secondLine: '',
        townOrCity: 'SWINDON',
        postcode: 'HN5 8UH',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, false)).toBe(
        '1 Prunus Walk<br>Swindon<br>HN5 8UH',
      )
    })

    it('preserves postcode casing', () => {
      const address = {
        firstLine: 'flat 3b',
        secondLine: '',
        townOrCity: 'london',
        postcode: 'e1 6an',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, false)).toBe('Flat 3B<br>London<br>e1 6an')
    })

    it('handles apostrophes correctly', () => {
      const address = {
        firstLine: "emilia's house",
        secondLine: '',
        townOrCity: "swindon's end",
        postcode: 'HN5 8UH',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, false)).toBe(
        "Emilia's House<br>Swindon's End<br>HN5 8UH",
      )
    })

    it('returns empty string for null address', () => {
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(null)).toBe('')
    })

    it('trims whitespace from parts', () => {
      const address = {
        firstLine: ' 10 downing street ',
        secondLine: ' ',
        townOrCity: ' london ',
        postcode: ' SW1A 2AA ',
      }
      expect(registerNunjucks().getFilter('formatAddressTitleCase')(address, false)).toBe(
        '10 Downing Street<br>London<br>SW1A 2AA',
      )
    })
  })

  describe('additionalConditionRow', () => {
    it('returns a row with "Delete" action when condition.data is empty', () => {
      const licence = { id: 'LIC123' }
      const condition = {
        id: 'COND456',
        code: 'CODE789',
        category: 'Test Category',
        sequence: 1,
        data: {},
        requiresInput: false,
      }
      const html = '<p>Condition HTML</p>'

      expect(registerNunjucks().getGlobal('additionalConditionRow')(licence, condition, html, true)).toEqual({
        sequence: 1,
        key: { text: 'Test Category' },
        value: { html: '<p>Condition HTML</p>' },
        actions: {
          items: [
            {
              attributes: {
                'data-qa': 'condition-action-CODE789',
              },
              href: `/licence/create/id/${licence.id}/additional-licence-conditions/condition/${condition.id}/delete?fromReview=true`,
              text: 'Delete',
              visuallyHiddenText: 'Delete condition',
            },
          ],
        },
      })
    })

    it('returns a row with "Change" action when condition.data is empty', () => {
      const licence = { id: 'LIC123' }
      const condition = {
        id: 'COND456',
        code: 'CODE789',
        category: 'Test Category',
        sequence: 1,
        data: [
          {
            id: 1,
            sequence: 0,
            field: 'probationRegion',
            value: 'London',
            contributesToLicence: true,
          },
        ],
        requiresInput: true,
      }
      const html = '<p>Condition HTML</p>'

      expect(registerNunjucks().getGlobal('additionalConditionRow')(licence, condition, html, true)).toEqual({
        sequence: 1,
        key: { text: 'Test Category' },
        value: { html: '<p>Condition HTML</p>' },
        actions: {
          items: [
            {
              attributes: {
                'data-qa': 'condition-action-CODE789',
              },
              href: '/licence/create/id/LIC123/additional-licence-conditions/condition/COND456?fromReview=true',
              text: 'Change',
              visuallyHiddenText: 'Change condition',
            },
          ],
        },
      })
    })
  })
})
