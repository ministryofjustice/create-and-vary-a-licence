import fs from 'fs'
import * as cheerio from 'cheerio'
import { format, addDays, subDays } from 'date-fns'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import ConditionService from '../../../services/conditionService'

const snippet = fs.readFileSync('server/views/pages/vary/confirmVaryQuestion.njk')

describe('Confirm vary', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display the hint text', () => {
    viewContext = {
      licence: {
        typeCode: 'AP_PSS',
        topupSupervisionStartDate: '19/12/2022',
        topupSupervisionExpiryDate: format(addDays(new Date(), 10), 'dd/MM/yyyy'),
        licenceExpiryDate: '18/12/2022',
      },
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.govuk-hint').text()).toContain(
      'This person reached their LED on 18 Dec 2022, so only their post sentence supervision order can be varied.'
    )
  })
  it('should not display the hint text', () => {
    viewContext = {
      licence: {
        typeCode: 'AP_PSS',
        topupSupervisionStartDate: format(subDays(new Date(), 10), 'dd/MM/yyyy'),
        topupSupervisionExpiryDate: format(subDays(new Date(), 8), 'dd/MM/yyyy'),
        licenceExpiryDate: '18/12/2022',
      },
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.govuk-hint').text().length).toBe(0)
  })
})
