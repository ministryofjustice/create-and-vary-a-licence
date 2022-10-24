import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import ConditionService from '../../services/conditionService'
import { registerNunjucks } from '../../utils/nunjucksSetup'

describe('View Partials - Form Error', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  it('should not show error summary if no errors exist', () => {
    viewContext = {
      errorSummaryList: [],
    }
    const nunjucksString = '{% include "partials/formError.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-error-summary').length).toBe(0)
  })

  it('should display error summary when errors exist', () => {
    viewContext = {
      validationErrors: [
        {
          field: 'field',
          message: 'Error',
        },
      ],
    }
    const nunjucksString = '{% include "partials/formError.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-error-summary__list > li').length).toBe(1)
    expect($('.govuk-error-summary__list > li > a').text()).toBe('Error')
  })
})
