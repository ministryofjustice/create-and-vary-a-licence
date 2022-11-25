import * as cheerio from 'cheerio'
import { format, addDays, subDays, addMonths } from 'date-fns'
import nunjucks, { Template } from 'nunjucks'
import ConditionService from '../services/conditionService'
import { registerNunjucks } from './nunjucksSetup'
import { Licence } from '../@types/licenceApiClientTypes'

describe('Nunjucks Filters', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>

  const njkEnv = registerNunjucks(conditionService)

  describe('initialiseName', () => {
    it('should return null if full name is not provided', () => {
      viewContext = {}
      const nunjucksString = '{{ fullName | initialiseName }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('body').text()).toBe('')
    })

    it('should return formatted name', () => {
      viewContext = {
        fullName: 'Joe Bloggs',
      }
      const nunjucksString = '{{ fullName | initialiseName }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('body').text()).toBe('J. Bloggs')
    })
  })

  describe('concatValues', () => {
    it('should return null if object is not provided', () => {
      viewContext = {}
      const nunjucksString = '{{ testObject | concatValues }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('body').text()).toBe('')
    })

    it('should return concatenated object values', () => {
      viewContext = {
        testObject: {
          data1: 'test1',
          data2: 'test2',
          data3: 'test3',
        },
      }
      const nunjucksString = '{{ testObject | concatValues }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('body').text()).toBe('test1, test2, test3')
    })
  })

  describe('errorSummaryList', () => {
    it('should map errors to text and href', () => {
      viewContext = {
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
      }
      const nunjucksString = `
        {% set errorSummaryList = errors | errorSummaryList %}
        {% for error in errorSummaryList %}
            <a href="{{ errorSummaryList[loop.index0].href }}">{{ errorSummaryList[loop.index0].text }}</a>
        {% endfor %}
      `
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('a:nth-child(1)').text()).toBe('message1')
      expect($('a:nth-child(1)').attr('href')).toBe('#field1')
      expect($('a:nth-child(2)').text()).toBe('message2')
      expect($('a:nth-child(2)').attr('href')).toBe('#field2')
    })
  })

  describe('findError', () => {
    it('should find error from list of errors where field matches given value', () => {
      viewContext = {
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
      }
      const nunjucksString = `
        <div>{{ (errors | findError('field1')).text }}</div>
      `
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div').text()).toBe('message1')
    })
  })

  describe('fillFormResponse', () => {
    it('should return the override value if not undefined', () => {
      viewContext = {
        defaultValue: 'default',
        overrideValue: 'override',
      }
      const nunjucksString = `
        <div>{{ (defaultValue | fillFormResponse(overrideValue)) }}</div>
      `
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div').text()).toBe('override')
    })

    it('should return the default value if override is undefined', () => {
      viewContext = {
        defaultValue: 'default',
        overrideValue: undefined,
      }
      const nunjucksString = `
        <div>{{ (defaultValue | fillFormResponse(overrideValue)) }}</div>
      `
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div').text()).toBe('default')
    })
  })

  describe('Format addresses', () => {
    it('should remove blank address lines and return comma-separated string', () => {
      viewContext = { address: '12, Peel Street, , , Grangemouth, Lancashire, GM12 84L' }
      const nunjucksString = '{{ address | formatAddress }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('12, Peel Street, Grangemouth, Lancashire, GM12 84L')
    })

    it('should remove blank address lines and return a list of strings (no spaces)', () => {
      viewContext = { address: '12, Peel Street, , , Grangemouth, Lancashire, GM12 84L' }
      const nunjucksString = '{{ address | formatAddressAsList }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('12,Peel Street,Grangemouth,Lancashire,GM12 84L')
    })
  })

  describe('Format list as string', () => {
    it('should render a list as a string', () => {
      viewContext = { roleList: ['ROLE_A', 'ROLE_B', 'ROLE_C'] }
      const nunjucksString = '{{ roleList | formatListAsString | safe }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe("['ROLE_A','ROLE_B','ROLE_C']")
    })

    it('should render an empty list as a string', () => {
      viewContext = { roleList: [] }
      const nunjucksString = '{{ roleList | formatListAsString | safe }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('[]')
    })

    it('should render a null list as a string', () => {
      viewContext = { roleList: null }
      const nunjucksString = '{{ roleList | formatListAsString | safe }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('[]')
    })
  })

  describe('Format dates and times', () => {
    it('should format a date and time', () => {
      viewContext = { testDateTime: '23/12/2021 11:15' }
      const nunjucksString = '{{ testDateTime | datetimeToDate }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('23rd December 2021')
    })

    it('should format a date and time with short GOVUK format', () => {
      viewContext = { testDateTime: '23/12/2021 11:15' }
      const nunjucksString = '{{ testDateTime | datetimeToDateShort }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('23 Dec 2021')
    })

    it('should format a date and time with full day', () => {
      viewContext = { testDateTime: '23/12/2021 11:15' }
      const nunjucksString = '{{ testDateTime | datetimeToDateWithDay }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('Thursday 23rd December 2021')
    })

    it('should format a date and time to a 12-hour time', () => {
      viewContext = { testDateTime: '23/12/2021 21:15' }
      const nunjucksString = '{{ testDateTime | datetimeTo12HourTime }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
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

      const result = njkEnv.getFilter('toChecked')(model, 'code', 'desc', ['CAR', 'BOAT'])

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

  describe('Extract specified value from object array', () => {
    it('extractAttr', () => {
      const model = [
        { id: 'a', description: 'Letter A' },
        { id: 'b', description: 'Letter B' },
        { id: 'c', description: 'Letter C' },
      ]

      const result = njkEnv.getFilter('extractAttr')(model, 'description')

      expect(result).toEqual(['Letter A', 'Letter B', 'Letter C'])
    })
  })

  describe('dateToDisplay', () => {
    it('Should handle AP licence with led', () => {
      const licence = { typeCode: 'AP', licenceExpiryDate: '17/12/2022' } as Licence
      const result = njkEnv.getFilter('dateToDisplay')(licence)
      expect(result).toEqual('Licence end date: 17 Dec 2022')
    })
    it('Should handle AP licence without led', () => {
      const licence = { typeCode: 'AP', licenceExpiryDate: undefined } as Licence
      const result = njkEnv.getFilter('dateToDisplay')(licence)
      expect(result).toEqual('Licence end date: not available')
    })

    it('Should handle AP_PSS where tussd is not today', () => {
      const tomorrow = format(addDays(new Date(), 1), 'd/MM/yyyy')
      const licenceExpiryDate = '12/12/2022'
      const licence = { typeCode: 'AP_PSS', topupSupervisionStartDate: tomorrow, licenceExpiryDate } as Licence
      const result = njkEnv.getFilter('dateToDisplay')(licence)
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
      const result = njkEnv.getFilter('dateToDisplay')(licence)
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
      const result = njkEnv.getFilter('dateToDisplay')(licence)
      expect(result).toEqual(`PSS end date: ${tusedInLongerForm}`)
    })

    it('Should handle PSS licence', () => {
      const licence = { typeCode: 'PSS', topupSupervisionExpiryDate: '13/12/2022' } as Licence
      const result = njkEnv.getFilter('dateToDisplay')(licence)
      expect(result).toEqual('PSS end date: 13 Dec 2022')
    })
  })
})
