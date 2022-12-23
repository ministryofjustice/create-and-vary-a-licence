import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import ConditionService from '../../../services/conditionService'
import statusConfig from '../../../licences/licenceStatus'

const snippet = fs.readFileSync('server/views/pages/vary/caseload.njk')

describe('Caseload', () => {
  let compiledTemplate: Template

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  let viewContext = {} as unknown as Record<string, unknown>

  it('should not display badge', () => {
    viewContext = {
      caseload: [
        {
          licenceId: 3,
          name: 'Biydaav Griya',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
      ],
      statusConfig,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.status-badge')).toHaveLength(0)
  })

  it('should display Variation in progress badge', () => {
    viewContext = {
      caseload: [
        {
          licenceId: 3,
          name: 'Biydaav Griya',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'VARIATION_IN_PROGRESS',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
      ],
      statusConfig,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.status-badge').text().toString()).toContain('Variation in progress')
  })

  it('should display On PSS badge', () => {
    viewContext = {
      caseload: [
        {
          licenceId: 3,
          name: 'Biydaav Griya',
          crnNumber: 'Z882661',
          licenceType: 'AP_PSS',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ON_PSS',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
      ],
      statusConfig,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.status-badge').text().toString()).toContain('On PSS')
  })
})
