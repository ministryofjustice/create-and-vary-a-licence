import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'

const additionalCondition = { text: 'Condition 1', code: 'condition1', requiresInput: true, category: 'group1' }
const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
jest.spyOn(conditionService, 'getAdditionalConditionByCode').mockResolvedValue(additionalCondition)

const snippet = fs.readFileSync('server/views/pages/view/view.njk')

describe('View and print - single licence view', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks(conditionService)

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  const licence = {
    id: 1,
    statusCode: 'APPROVED',
    typeCode: 'AP_PSS',
    forename: 'John',
    surname: 'Smith',
    appointmentPerson: 'Jack Frost',
    appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
    additionalLicenceConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        expandedText: 'Template 1',
        data: [
          {
            field: 'field1',
            value: 'Data 1',
          },
        ],
      },
      {
        code: 'condition2',
        category: 'Category 2',
        expandedText: 'Template 2',
        data: [
          {
            field: 'field2',
            value: 'Data 2A',
          },
          {
            field: 'field2',
            value: 'Data 2B',
          },
          {
            field: 'field3',
            value: 'Data 2C',
          },
        ],
      },
    ],
    additionalPssConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        expandedText: 'Template 1',
        data: [
          {
            field: 'field1',
            value: 'Data 1',
          },
        ],
      },
    ],
    bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
  } as Licence

  it('should display a single licence to print to COM user', () => {
    viewContext = {
      licence,
      additionalConditions: [
        {
          code: 'condition1',
          category: 'Category 1',
          expandedText: 'Template 1',
          data: [
            {
              field: 'field1',
              value: 'Data 1',
            },
          ],
        },
        {
          code: 'condition2',
          category: 'Category 2',
          expandedText: 'Template 2',
          data: [
            {
              field: 'field2',
              value: 'Data 2A',
            },
            {
              field: 'field2',
              value: 'Data 2B',
            },
            {
              field: 'field3',
              value: 'Data 2C',
            },
          ],
        },
      ],
      conditionsWithUploads: [],
      // should show 'selected' text in additional licence conditions heading when COM user
      showConditionCountSelectedText: true,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    // Check the appropriate title is used
    expect($('h1').text()).toContain('Print licence and post sentence supervision order for John Smith')

    // Check the initial meeting details are populated
    expect($('#induction-meeting-details > .govuk-summary-list__row').length).toBe(5)

    // Check the additional conditions count (including the always-present counter
    expect($('#additionalLicenceConditions > .govuk-summary-list__row').length).toBe(2)

    // Check the additional licence conditions count is contained in the heading
    expect($('#additional-licence-conditions-heading').text().trim()).toBe('Additional licence conditions (2 selected)')

    // Check the actual conditions
    expect($('#additionalLicenceConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 1'
    )
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe(
      'Data 1'
    )

    expect($('#additionalLicenceConditions > div:nth-child(2) > dt').text().trim()).toBe('Category 2')
    expect($('#additionalLicenceConditions > div:nth-child(2) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 2'
    )
    expect(
      $('#additionalLicenceConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(1)').text().trim()
    ).toBe('Data 2A, Data 2B')
    expect(
      $('#additionalLicenceConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(2)').text().trim()
    ).toBe('Data 2C')

    // Check the additional pss conditions are rendered correctly
    expect($('#additionalPssConditions > .govuk-summary-list__row').length).toBe(1)

    // Check the additional PSS count is contained in the heading
    expect($('#additional-pss-conditions-heading').text().trim()).toBe(
      'Additional post sentence supervision requirements (1 selected)'
    )

    // Check the actual PSS requirement
    expect($('#additionalPssConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe('Template 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe('Data 1')

    // Check the bespoke conditions are rendered correctly using the macro for them
    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(2)

    // Check the bespoke condition count is contained in the heading
    expect($('#bespoke-licence-conditions-heading').text().trim()).toBe('Bespoke licence conditions (2 selected)')

    // Check the actual bespoke conditions
    expect($('#bespoke-conditions-details > div:nth-child(1) > dd').text().trim()).toBe('Bespoke condition 1')
    expect($('#bespoke-conditions-details > div:nth-child(2) > dd').text().trim()).toBe('Bespoke condition 2')

    // Check the existence of the print and return to case list buttons
    expect($('[data-qa="print-licence"]').length).toBe(2)
    expect($('[data-qa="return-to-view-list"]').length).toBe(1)
  })

  it('should display correct heading text to OMU user', () => {
    viewContext = {
      licence,
      additionalConditions: [
        {
          code: 'condition1',
          category: 'Category 1',
          expandedText: 'Template 1',
          data: [
            {
              field: 'field1',
              value: 'Data 1',
            },
          ],
        },
        {
          code: 'condition2',
          category: 'Category 2',
          expandedText: 'Template 2',
          data: [
            {
              field: 'field2',
              value: 'Data 2A',
            },
            {
              field: 'field2',
              value: 'Data 2B',
            },
            {
              field: 'field3',
              value: 'Data 2C',
            },
          ],
        },
      ],
      conditionsWithUploads: [],
      // should not show 'selected' text in additional licence conditions heading when OMU user
      showConditionCountSelectedText: false,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    // Check the additional licence conditions count is contained in the heading
    expect($('#additional-licence-conditions-heading').text().trim()).toBe('Additional licence conditions (2)')
    expect($('#bespoke-licence-conditions-heading').text().trim()).toBe('Bespoke licence conditions (2)')
  })

  it('Print buttons are not visible when licence is not approved or active', () => {
    viewContext = { licence: { ...licence, statusCode: 'SUBMITTED' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('[data-qa="print-licence"]').length).toBe(0)
  })

  it('Title changes to view when licence is not printable', () => {
    viewContext = { licence: { ...licence, statusCode: 'SUBMITTED' } }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toContain('View licence and post sentence supervision order for John Smith')
  })

  it('Title changes depending on licence type', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'ACTIVE', typeCode: 'PSS' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h1').text()).toContain('Print post sentence supervision order for John Smith')
  })
})
