import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/create/caseload.njk')

describe('Create a Licence Views - Caseload', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display a table containing the caseload', () => {
    viewContext = {
      caseload: [
        {
          name: 'Adam Balasaravika',
          crnNumber: 'X381306',
          conditionalReleaseDate: '03 August 2022',
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          conditionalReleaseDate: '01 September 2022',
        },
      ],
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1').text()).toBe('Adam Balasaravika')
    expect($('#crn-1').text()).toBe('X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#name-2').text()).toBe('John Smith')
    expect($('#crn-2').text()).toBe('X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
  })
})
