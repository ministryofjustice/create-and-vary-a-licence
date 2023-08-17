import fs from 'fs'
import * as cheerio from 'cheerio'
import { addDays } from 'date-fns'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

import { Licence, StandardConditions } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import { LicencePolicy } from '../../../@types/LicencePolicy'

const activeConditions = {
  version: '1.0',
  standardConditions: {} as StandardConditions,
  additionalConditions: {
    AP: [
      {
        text: 'Condition 1',
        code: 'condition1',
        requiresInput: true,
        category: 'category1',
      },
      {
        text: 'Condition 2',
        code: 'condition2',
        requiresInput: true,
        category: 'category2',
      },
    ],
    PSS: [
      {
        text: 'Condition 1',
        code: 'condition1',
        requiresInput: true,
        category: 'category1',
      },
      {
        text: 'Condition 2',
        code: 'condition2',
        requiresInput: true,
        category: 'category1',
      },
    ],
    bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
  },
  changeHints: [],
} as LicencePolicy

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>

jest.spyOn(conditionService, 'getAdditionalConditions').mockResolvedValue(activeConditions.additionalConditions)

const snippet = fs.readFileSync('server/views/pages/create/checkAnswers.njk')

describe('Create a Licence Views - Check Answers', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks(conditionService)

  const licence = {
    id: 1,
    typeCode: 'AP_PSS',
    statusCode: 'IN_PROGRESS',
    additionalLicenceConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        expandedText: 'Template 1',
        uploadSummary: [],
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
        uploadSummary: [],
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
        uploadSummary: [],
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
        uploadSummary: [],
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
    bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
  } as Licence

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display additional licence conditions section if licence type is AP', () => {
    viewContext = { licence: { ...licence, typeCode: 'AP' } }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-licence-conditions-heading').text()).toContain('Additional licence conditions')
  })

  it('should display additional licence conditions section if licence type is AP_PSS', () => {
    viewContext = { licence }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-licence-conditions-heading').text()).toContain('Additional licence conditions')
  })

  it(`should display 'selected' text in additional licence conditions heading to a COM user`, () => {
    viewContext = {
      licence,
      additionalConditions: licence.additionalLicenceConditions,
      conditionsWithUploads: [],
      backLink: 'backlink',
      showConditionCountSelectedText: true,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-licence-conditions-heading').text()).toBe('Additional licence conditions (2 selected)')
  })

  it(`should display not 'selected' text in additional licence conditions heading to an OMU user`, () => {
    viewContext = {
      licence,
      additionalConditions: licence.additionalLicenceConditions,
      conditionsWithUploads: [],
      backLink: 'backlink',
      showConditionCountSelectedText: false,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-licence-conditions-heading').text()).toBe('Additional licence conditions (2)')
  })

  it('should not display additional licence conditions section if licence type is PSS', () => {
    viewContext = { licence: { ...licence, typeCode: 'PSS' } }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-licence-conditions-heading').length).toBe(0)
  })

  it('should display a table containing the additional licence conditions', () => {
    viewContext = {
      licence,
      additionalConditions: [
        {
          code: 'condition1',
          category: 'Category 1',
          expandedText: 'Template 1',
          uploadSummary: [],
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
          uploadSummary: [],
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
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#additionalLicenceConditions > .govuk-summary-list__row').length).toBe(2)

    // Check actual condition wording - 1st
    expect($('#additionalLicenceConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 1'
    )
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe(
      'Data 1'
    )

    // Check actual condition wording - 2nd
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
  })

  it('should display additional PSS conditions section if licence type is PSS', () => {
    viewContext = {
      licence: { ...licence, typeCode: 'PSS' },
      showConditionCountSelectedText: true,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-pss-conditions-heading').text()).toBe(
      'Additional post sentence supervision requirements (2 selected)'
    )
  })

  it('should display additional PSS conditions section if licence type is AP_PSS', () => {
    viewContext = {
      licence,
      showConditionCountSelectedText: true,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-pss-conditions-heading').text()).toBe(
      'Additional post sentence supervision requirements (2 selected)'
    )
  })

  it('should not display additional PSS licence conditions section if licence type is AP', () => {
    viewContext = { licence: { ...licence, typeCode: 'AP' } }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-pss-conditions-heading').length).toBe(0)
  })

  it('should display a table containing the additional PSS conditions', () => {
    viewContext = {
      licence: { ...licence, typeCode: 'PSS' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#additionalPssConditions > .govuk-summary-list__row').length).toBe(2)

    expect($('#additionalPssConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe('Template 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe('Data 1')

    expect($('#additionalPssConditions > div:nth-child(2) > dt').text().trim()).toBe('Category 2')
    expect($('#additionalPssConditions > div:nth-child(2) > dd > div:nth-child(1)').text().trim()).toBe('Template 2')
    expect(
      $('#additionalPssConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(1)').text().trim()
    ).toBe('Data 2A, Data 2B')
    expect(
      $('#additionalPssConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(2)').text().trim()
    ).toBe('Data 2C')
  })

  it('should display a table containing the bespoke conditions for AP licences', () => {
    viewContext = {
      licence: { ...licence, typeCode: 'AP' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(2)

    expect($('#bespoke-conditions-details > div:nth-child(1) > .govuk-summary-list__value').text().trim()).toBe(
      'Bespoke condition 1'
    )
    expect($('#bespoke-conditions-details > div:nth-child(2) > .govuk-summary-list__value').text().trim()).toBe(
      'Bespoke condition 2'
    )
  })

  it('should show change links and submit button when licence status is IN_PROGRESS', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'IN_PROGRESS' },
      additionalConditions: [
        {
          code: 'condition1',
          category: 'Category 1',
          expandedText: 'Template 1',
          uploadSummary: [],
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
          uploadSummary: [],
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
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-summary-list__actions').length).toBe(11)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(1)
  })

  it('should hide edit licence button when status is IN_PROGRESS', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'IN_PROGRESS' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#edit-licence-button').length).toBe(0)
    expect($('#edit-licence-button-2').length).toBe(0)
  })

  it('should hide edit licence button when status is ACTIVE', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'ACTIVE' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#edit-licence-button').length).toBe(0)
    expect($('#edit-licence-button-2').length).toBe(0)
  })

  it('should show edit licence button when status is APPROVED', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'APPROVED' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#edit-licence-button').length).toBe(1)
    expect($('#edit-licence-button-2').length).toBe(1)
  })

  it('should show edit licence button when status is SUBMITTED', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'SUBMITTED' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#edit-licence-button').length).toBe(1)
    expect($('#edit-licence-button-2').length).toBe(1)
  })

  it('should show print licence button when status is APPROVED', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'APPROVED' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#print-licence-button').length).toBe(1)
    expect($('#print-licence-button-2').length).toBe(1)
  })

  it('should hide print licence button when status is SUBMITTED', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'SUBMITTED' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#print-licence-button').length).toBe(0)
    expect($('#print-licence-button-2').length).toBe(0)
  })

  it('should hide change links and submit button when licence status is not IN_PROGRESS', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'SUBMITTED' },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-summary-list__actions').length).toBe(0)
    expect($('.check-answers-header__change-link').length).toBe(0)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(0)
  })

  it('should display correct date description for "non-vary" routes ', () => {
    const tomorrow = addDays(new Date(), 1)

    viewContext = {
      isVaryJourney: false,
      licence: { typeCode: 'AP', licenceExpiryDate: tomorrow },
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('[data-qa=date]').text()).toContain('Release date')
    expect($('[data-qa=date]').text()).not.toContain('Licence end date')
  })
})
