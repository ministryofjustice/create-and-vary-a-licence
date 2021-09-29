import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from './nunjucksSetup'

describe('Nunjucks Filters', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

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
})
