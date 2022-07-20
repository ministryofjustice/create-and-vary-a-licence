import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/vary/timeline.njk')

describe('Timeline', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display the text Last update with the date', () => {
    viewContext = {
      timelineEvents: [
        {
          eventType: 'VARIATION_IN_PROGRESS',
          title: 'Variation in progress',
          statusCode: 'VARIATION_IN_PROGRESS',
          createdBy: 'CVL COM',
          licenceId: 3,
          lastUpdate: '18/07/2022 11:03:07',
        },
      ],
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.moj-timeline__date').text()).toContain('Last update: ')
  })

  it('should not display the text Last update with the date', () => {
    viewContext = {
      timelineEvents: [
        {
          eventType: 'SUBMITTED',
          title: 'Variation submitted',
          statusCode: 'VARIATION_SUBMITTED',
          createdBy: 'CVL COM',
          licenceId: 3,
          lastUpdate: '18/07/2022 11:03:07',
        },
      ],
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.moj-timeline__date').text()).not.toContain('Last update: ')
  })
})
