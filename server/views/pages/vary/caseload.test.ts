import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import ConditionService from '../../../services/conditionService'

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
      statusConfig: {
        ACTIVE: {
          label: 'Active',
          description: 'Approved by the prison and is now the currently active licence',
          colour: 'turquoise',
        },
        VARIATION_IN_PROGRESS: {
          label: 'Variation in progress',
          description: 'Variation in progress',
          colour: 'blue',
        },
      },
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.status-badge')).toHaveLength(0)
  })

  it('should display badge', () => {
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
      statusConfig: {
        ACTIVE: {
          label: 'Active',
          description: 'Approved by the prison and is now the currently active licence',
          colour: 'turquoise',
        },
        VARIATION_IN_PROGRESS: {
          label: 'Variation in progress',
          description: 'Variation in progress',
          colour: 'blue',
        },
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.status-badge').text().toString()).toContain('Variation in progress')
  })
})
