import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { addDays, format } from 'date-fns'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import ConditionService from '../../../services/conditionService'
import { AdditionalConditionPss } from '../../../@types/licenceApiClientTypes'

const snippet = fs.readFileSync('server/views/pages/vary/viewActive.njk')

describe('View active licence', () => {
  let compiledTemplate: Template

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  conditionService.getAdditionalConditionByCode = jest.fn()
  conditionService.getAdditionalConditionByCode.mockResolvedValue({} as AdditionalConditionPss)
  const njkEnv = registerNunjucks(conditionService)

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  let viewContext = {} as unknown as Record<string, unknown>

  it('should display the Conditions from expired licence section', () => {
    viewContext = {
      licence: {
        typeCode: 'AP_PSS',
        topupSupervisionStartDate: '19/12/2022',
        topupSupervisionExpiryDate: format(addDays(new Date(), 10), 'dd/MM/yyyy'),
        licenceExpiryDate: '18/12/2022',
      },
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('[data-qa=expired-licence-heading]')).toHaveLength(1)
    expect($('[data-qa=expired-licence-text]')).toHaveLength(1)
    expect($('[data-qa=expired-licence-text]').text()).toContain('This person reached their LED on 18 Dec 2022, so')
    expect($('.govuk-details__summary-text')).toHaveLength(1)
  })

  it('should NOT display the Conditions from expired licence section', () => {
    viewContext = {
      licence: {
        typeCode: 'AP_PSS',
        topupSupervisionStartDate: format(addDays(new Date(), 2), 'dd/MM/yyyy'),
        topupSupervisionExpiryDate: format(addDays(new Date(), 10), 'dd/MM/yyyy'),
        licenceExpiryDate: '18/12/2022',
      },
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('[data-qa=expired-licence-heading]')).toHaveLength(0)
    expect($('[data-qa=expired-licence-text]')).toHaveLength(0)
    expect($('.govuk-details__summary-text')).toHaveLength(0)
  })
})
