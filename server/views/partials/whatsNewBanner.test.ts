import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import ConditionService from '../../services/conditionService'
import { registerNunjucks } from '../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/partials/whatsNewBanner.njk')

describe('Whats new banner', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('Show whats new banner if showCommsBanner is true', () => {
    viewContext = {
      showCommsBanner: true,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('body').text()).toContain("What's new")
  })

  it('Hide whats new banner if showCommsBanner is true', () => {
    viewContext = {
      showCommsBanner: false,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('body').text()).not.toContain("What's new")
  })
})
