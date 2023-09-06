import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import ConditionService from '../../../services/conditionService'

const snippet = fs.readFileSync('server/views/pages/manageConditions/bespokeConditions.njk')

describe('Create a Licence Views - Bespoke Conditions', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display just one textarea if no conditions exist on the licence already', () => {
    viewContext = {
      conditions: undefined,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('textarea').length).toBe(1)
  })

  it('should not display a remove button if no conditions exist on the licence already', () => {
    viewContext = {
      conditions: undefined,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.moj-add-another__remove-button').length).toBe(0)
  })

  it('should display just one populated textarea if only 1 condition exists on the licence', () => {
    viewContext = {
      conditions: ['bespokeCondition1'],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('textarea').length).toBe(1)
    expect($('#conditions\\[0\\]').text()).toBe('bespokeCondition1')
  })

  it('should not display a remove button if just one condition exists on the licence', () => {
    viewContext = {
      conditions: ['bespokeCondition1'],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.moj-add-another__remove-button').length).toBe(0)
  })

  it('should display two populated textareas if 2 conditions exist on the licence', () => {
    viewContext = {
      conditions: ['bespokeCondition1', 'bespokeCondition2'],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('textarea').length).toBe(2)
    expect($('#conditions\\[0\\]').text()).toBe('bespokeCondition1')
    expect($('#conditions\\[1\\]').text()).toBe('bespokeCondition2')
  })

  it('should display two remove buttons if 2 conditions exist on the licence', () => {
    viewContext = {
      conditions: ['bespokeCondition1', 'bespokeCondition2'],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.moj-add-another__remove-button').length).toBe(2)
  })
})
