import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import ConditionService from '../../services/conditionService'
import { registerNunjucks } from '../../utils/nunjucksSetup'

describe('View Partials - Date Picker', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  it('should add error class to inputs when an error is present', () => {
    viewContext = {
      options: {
        id: 'datePicker',
        errorMessage: {
          text: 'error',
        },
      },
    }
    const nunjucksString = '{% from "partials/datePicker.njk" import datePicker %}{{ datePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#datePicker-day').hasClass('govuk-input--error')).toBe(true)
    expect($('#datePicker-month').hasClass('govuk-input--error')).toBe(true)
    expect($('#datePicker-year').hasClass('govuk-input--error')).toBe(true)
  })

  it('should not add error class to inputs when an error is not present', () => {
    viewContext = {
      options: {
        id: 'datePicker',
      },
    }
    const nunjucksString = '{% from "partials/datePicker.njk" import datePicker %}{{ datePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#datePicker-day').hasClass('govuk-input--error')).toBe(false)
    expect($('#datePicker-month').hasClass('govuk-input--error')).toBe(false)
    expect($('#datePicker-year').hasClass('govuk-input--error')).toBe(false)
  })
})
