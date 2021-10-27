import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/view/view.njk')

describe('View and print - single licence view', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display a single licence to print', () => {
    viewContext = {
      licence: {
        id: 1,
        forename: 'John',
        surname: 'Smith',
        appointmentPerson: 'Jack Frost',
        appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
        comTelephone: '07878 234566',
        additionalConditions: [
          {
            category: 'Category 1',
            text: 'Template 1',
            data: ['Data 1'],
          },
          {
            category: 'Category 2',
            text: 'Template 2',
            data: ['Data 2A', 'Data 2B'],
          },
        ],
        bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toContain('John Smith')

    // Check the initial meeting details are populated
    expect($('#induction-meeting-details > .govuk-summary-list__row').length).toBe(5)

    // Check the additonal conditions are rendered correctly using the macro for them
    expect($('#additional-conditions-details > .govuk-summary-list__row').length).toBe(2)
    expect($('#additional-conditions-details > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additional-conditions-details > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 1'
    )
    expect($('#additional-conditions-details > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe(
      'Data 1'
    )
    expect($('#additional-conditions-details > div:nth-child(2) > dt').text().trim()).toBe('Category 2')
    expect($('#additional-conditions-details > div:nth-child(2) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 2'
    )
    expect(
      $('#additional-conditions-details > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(1)').text().trim()
    ).toBe('Data 2A')
    expect(
      $('#additional-conditions-details > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(2)').text().trim()
    ).toBe('Data 2B')

    // Check the bespoke conditions are rendered correctly using the macro for them
    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(2)
    expect($('#bespoke-conditions-details > div:nth-child(1) > dd').text().trim()).toBe('Bespoke condition 1')
    expect($('#bespoke-conditions-details > div:nth-child(2) > dd').text().trim()).toBe('Bespoke condition 2')

    // Check the existence of the print and return to case list buttons
    expect($('[data-qa="print-licence"]').length).toBe(1)
    expect($('[data-qa="return-to-view-list"]').length).toBe(1)
  })
})
