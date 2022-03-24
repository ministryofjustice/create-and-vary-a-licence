import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/view/cases.njk')

describe('View and print a licence - case list', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display a table containing licences to print', () => {
    viewContext = {
      cases: [
        {
          name: 'Adam Balasaravika',
          prisonerNumber: 'A1234AA',
          releaseDate: '3 Aug 2022',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '1 Sep 2022',
        },
      ],
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > div > span').text()).toBe('Adam Balasaravika')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('3 Aug 2022')
    expect($('#name-2 > div > span').text()).toBe('John Smith')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#release-date-2').text()).toBe('1 Sep 2022')
  })
})
