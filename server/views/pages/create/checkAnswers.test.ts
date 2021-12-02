import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

import * as conditionsProvider from '../../../utils/conditionsProvider'
import { Licence } from '../../../@types/licenceApiClientTypes'

const additionalCondition = { code: 'condition1', inputRequired: true }

jest.spyOn(conditionsProvider, 'getAdditionalConditionByCode').mockReturnValue(additionalCondition)

const snippet = fs.readFileSync('server/views/pages/create/checkAnswers.njk')

describe('Create a Licence Views - Check Answers', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  const licence = {
    id: 1,
    typeCode: 'AP_PSS',
    statusCode: 'IN_PROGRESS',
    additionalLicenceConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        text: 'Template 1',
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
        text: 'Template 2',
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
        text: 'Template 1',
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
        text: 'Template 2',
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
    expect($('#additional-licence-conditions-heading').text()).toBe('Additional conditions details')
  })

  it('should display additional licence conditions section if licence type is AP_PSS', () => {
    viewContext = { licence }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-licence-conditions-heading').text()).toBe('Additional conditions details')
  })

  it('should not display additional licence conditions section if licence type is PSS', () => {
    viewContext = { licence: { ...licence, typeCode: 'PSS' } }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-licence-conditions-heading').length).toBe(0)
  })

  it('should display a table containing the additional licence conditions', () => {
    viewContext = {
      licence,
      expandedLicenceConditions: licence.additionalLicenceConditions,
      expandedPssConditions: licence.additionalLicenceConditions,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#additional-licence-conditions-details > .govuk-summary-list__row').length).toBe(3)

    // Check actual condition wording - 1st
    expect($('#additional-licence-conditions-details > div:nth-child(2) > dt').text().trim()).toBe('Category 1')
    expect($('#additional-licence-conditions-details > div:nth-child(2) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 1'
    )
    expect(
      $('#additional-licence-conditions-details > div:nth-child(2) > dd > div:nth-child(2) > span').text().trim()
    ).toBe('Data 1')

    // Check actual condition wording - 2nd
    expect($('#additional-licence-conditions-details > div:nth-child(3) > dt').text().trim()).toBe('Category 2')
    expect($('#additional-licence-conditions-details > div:nth-child(3) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 2'
    )
    expect(
      $('#additional-licence-conditions-details > div:nth-child(3) > dd > div:nth-child(2) > span:nth-child(1)')
        .text()
        .trim()
    ).toBe('Data 2A, Data 2B')
    expect(
      $('#additional-licence-conditions-details > div:nth-child(3) > dd > div:nth-child(2) > span:nth-child(2)')
        .text()
        .trim()
    ).toBe('Data 2C')
  })

  it('should display additional PSS conditions section if licence type is PSS', () => {
    viewContext = {
      licence: { ...licence, typeCode: 'PSS' },
      expandedLicenceConditions: licence.additionalLicenceConditions,
      expandedPssConditions: licence.additionalLicenceConditions,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-pss-conditions-heading').text()).toBe('Additional post-sentence requirements details')
  })

  it('should display additional PSS conditions section if licence type is AP_PSS', () => {
    viewContext = {
      licence,
      expandedLicenceConditions: licence.additionalLicenceConditions,
      expandedPssConditions: licence.additionalLicenceConditions,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-pss-conditions-heading').text()).toBe('Additional post-sentence requirements details')
  })

  it('should not display additional licence conditions section if licence type is AP', () => {
    viewContext = { licence: { ...licence, typeCode: 'AP' } }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#additional-pss-conditions-heading').length).toBe(0)
  })

  it('should display a table containing the additional PSS conditions', () => {
    viewContext = {
      licence: { ...licence, typeCode: 'PSS' },
      expandedLicenceConditions: licence.additionalLicenceConditions,
      expandedPssConditions: licence.additionalLicenceConditions,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#additional-pss-conditions-details > .govuk-summary-list__row').length).toBe(3)

    expect($('#additional-pss-conditions-details > div:nth-child(2) > dt').text().trim()).toBe('Category 1')
    expect($('#additional-pss-conditions-details > div:nth-child(2) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 1'
    )
    expect(
      $('#additional-pss-conditions-details > div:nth-child(2) > dd > div:nth-child(2) > span').text().trim()
    ).toBe('Data 1')

    expect($('#additional-pss-conditions-details > div:nth-child(3) > dt').text().trim()).toBe('Category 2')
    expect($('#additional-pss-conditions-details > div:nth-child(3) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 2'
    )
    expect(
      $('#additional-pss-conditions-details > div:nth-child(3) > dd > div:nth-child(2) > span:nth-child(1)')
        .text()
        .trim()
    ).toBe('Data 2A, Data 2B')
    expect(
      $('#additional-pss-conditions-details > div:nth-child(3) > dd > div:nth-child(2) > span:nth-child(2)')
        .text()
        .trim()
    ).toBe('Data 2C')
  })

  it('should display a table containing the bespoke conditions for AP licences', () => {
    viewContext = {
      licence: { ...licence, typeCode: 'AP' },
      expandedLicenceConditions: licence.additionalLicenceConditions,
      expandedPssConditions: licence.additionalLicenceConditions,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(3)
    expect($('#bespoke-conditions-details > div:nth-child(2) > dd').text().trim()).toBe('Bespoke condition 1')
    expect($('#bespoke-conditions-details > div:nth-child(3) > dd').text().trim()).toBe('Bespoke condition 2')
  })

  it('should show change links and submit button when licence status is IN_PROGRESS', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'IN_PROGRESS' },
      expandedLicenceConditions: licence.additionalLicenceConditions,
      expandedPssConditions: licence.additionalLicenceConditions,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-summary-list__actions').length).toBe(14)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(1)
  })

  it('should hide change links and submit button when licence status is not IN_PROGRESS', () => {
    viewContext = {
      licence: { ...licence, statusCode: 'SUBMITTED' },
      expandedLicenceConditions: licence.additionalLicenceConditions,
      expandedPssConditions: licence.additionalLicenceConditions,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-summary-list__actions').length).toBe(0)
    expect($('.check-answers-header__change-link').length).toBe(0)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(0)
  })
})
