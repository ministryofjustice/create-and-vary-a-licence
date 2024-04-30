import { format, addDays, subDays, addMonths } from 'date-fns'
import { FoundProbationRecord, Licence } from '../@types/licenceApiClientTypes'
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
      expect($('body').text()).toBe('23rd December 2021')
    })

    it('should format a date and time with short GOVUK format', () => {
      const template = '{{ testDateTime | datetimeToDateShort }}'
      const $ = renderTemplate(template, { testDateTime: '23/12/2021 11:15' })
      expect($('body').text()).toBe('23 Dec 2021')
    })

    it('should format a date and time with full day', () => {
      const template = '{{ testDateTime | datetimeToDateWithDay }}'
      const $ = renderTemplate(template, { testDateTime: '23/12/2021 11:15' })
      expect($('body').text()).toBe('Thursday 23rd December 2021')
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
        'some-other-string'
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
      expect(result).toEqual('Licence end date: 17 Dec 2022')
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
      expect(result).toEqual('Licence end date: 12 Dec 2022')
    })

    it('Should handle AP_PSS where tussd is today', () => {
      const today = format(new Date(), 'd/MM/yyyy')
      const tused = format(addMonths(new Date(), 1), 'd/MM/yyyy')
      const tusedInLongerForm = format(addMonths(new Date(), 1), 'd MMM yyy')
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
      const tusedInLongerForm = format(addMonths(new Date(), 1), 'd MMM yyy')
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
      expect(result).toEqual('PSS end date: 13 Dec 2022')
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
        } as FoundProbationRecord)
      ).toEqual(LicenceStatus.REVIEW_NEEDED)
    })

    it('should return TIMED_OUT status', () => {
      expect(
        registerNunjucks().getFilter('getlicenceStatusForSearchResults')({
          isReviewNeeded: false,
          kind: LicenceKind.HARD_STOP,
          licenceStatus: LicenceStatus.SUBMITTED,
        } as FoundProbationRecord)
      ).toEqual(LicenceStatus.TIMED_OUT)
    })

    it('should return the same status as licence status', () => {
      expect(
        registerNunjucks().getFilter('getlicenceStatusForSearchResults')({
          isReviewNeeded: false,
          kind: LicenceKind.CRD,
          licenceStatus: LicenceStatus.SUBMITTED,
        } as FoundProbationRecord)
      ).toEqual(LicenceStatus.SUBMITTED)
    })
  })

  describe('cvlDateToDateShort', () => {
    it('should return not found string', () => {
      expect(registerNunjucks().getFilter('cvlDateToDateShort')('')).toEqual('not found')
    })

    it('should return dd MMM yyyy date format', () => {
      expect(registerNunjucks().getFilter('cvlDateToDateShort')('20/04/2024')).toEqual('20 Apr 2024')
    })
  })

  describe('createOffenderLink', () => {
    it('should return licence-changes-not-approved-in-time page', () => {
      expect(
        registerNunjucks().getFilter('createOffenderLink')({
          licenceId: 2,
          licenceStatus: LicenceStatus.TIMED_OUT,
          kind: LicenceKind.CRD,
          versionOf: 1,
        } as FoundProbationRecord)
      ).toEqual('/licence/create/id/2/licence-changes-not-approved-in-time')
    })

    it('should return prison-will-create-this-licence page', () => {
      expect(
        registerNunjucks().getFilter('createOffenderLink')({
          licenceId: 2,
          licenceStatus: LicenceStatus.TIMED_OUT,
          kind: LicenceKind.CRD,
          nomisId: 'A1234BC',
        } as FoundProbationRecord)
      ).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')

      expect(
        registerNunjucks().getFilter('createOffenderLink')({
          licenceId: 2,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          kind: LicenceKind.HARD_STOP,
          nomisId: 'A1234BC',
        } as FoundProbationRecord)
      ).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
    })

    it('should return licence-created-by-prison page', () => {
      expect(
        registerNunjucks().getFilter('createOffenderLink')({
          licenceId: 2,
          licenceStatus: LicenceStatus.ACTIVE,
          kind: LicenceKind.HARD_STOP,
          nomisId: 'A1234BC',
        } as FoundProbationRecord)
      ).toEqual('/licence/create/id/2/licence-created-by-prison')
    })

    it('should return cnfirm create licence page', () => {
      expect(
        registerNunjucks().getFilter('createOffenderLink')({
          licenceId: null,
          licenceStatus: LicenceStatus.NOT_STARTED,
          kind: LicenceKind.CRD,
          nomisId: 'A1234BC',
        } as FoundProbationRecord)
      ).toEqual('/licence/create/nomisId/A1234BC/confirm')
    })

    it('should return check-your-answers page', () => {
      expect(
        registerNunjucks().getFilter('createOffenderLink')({
          licenceId: 2,
          licenceStatus: LicenceStatus.SUBMITTED,
          kind: LicenceKind.CRD,
          nomisId: 'A1234BC',
        } as FoundProbationRecord)
      ).toEqual('/licence/create/id/2/check-your-answers')
    })
  })

  describe('legalStatus', () => {
    it('should return Recall', () => {
      expect(registerNunjucks().getFilter('legalStatus')('RECALL').getFilter('titlecase')).toEqual('Recall')
    })

    it('should return Indeterminate Sentence', () => {
      expect(registerNunjucks().getFilter('legalStatus')('INDETERMINATE_SENTENCE').getFilter('titlecase')).toEqual(
        'Indeterminate sentence'
      )
    })

    it('should return Immigration Detainee', () => {
      expect(registerNunjucks().getFilter('legalStatus')('IMMIGRATION_DETAINEE').getFilter('titlecase')).toEqual(
        'Immigration detainee'
      )
    })
  })
})
