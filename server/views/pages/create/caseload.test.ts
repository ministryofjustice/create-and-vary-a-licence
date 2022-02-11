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
    expect($('#name-1 > .caseload-offender-name > span').text()).toBe('Adam Balasaravika')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
  })

  it('should display probation practitioner in the table or unallocated', () => {
    viewContext = {
      caseload: [
        {
          name: 'Adam Balasaravika',
          crnNumber: 'X381306',
          conditionalReleaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffId: 2000,
          },
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          conditionalReleaseDate: '01 September 2022',
          probationPractitioner: null,
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > .caseload-offender-name > button').text()).toBe('Adam Balasaravika')
    expect($('#probation-practitioner-1').text()).toBe('Joe Bloggs')
    expect($('#probation-practitioner-1 > a').attr('href')).toBe('/licence/create/probation-practitioner/staffId/2000')

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#probation-practitioner-2').text()).toBe('Unallocated')
  })
})
