import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

import * as conditionsProvider from '../../../utils/conditionsProvider'

const additionalCondition = { code: 'condition1', inputRequired: true }

jest.spyOn(conditionsProvider, 'getAdditionalConditionByCode').mockReturnValue(additionalCondition)

const snippet = fs.readFileSync('server/views/pages/create/checkAnswers.njk')

describe('Create a Licence Views - Check Answers', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display a table containing the additional conditions', () => {
    viewContext = {
      licence: {
        additionalConditions: [
          {
            code: 'condition1',
            category: 'Category 1',
            text: 'Template 1',
            data: [
              {
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
                value: 'Data 2A',
              },
              {
                value: 'Data 2B',
              },
            ],
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

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
  })

  it('should display a table containing the bespoke conditions', () => {
    viewContext = {
      licence: {
        bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(2)
    expect($('#bespoke-conditions-details > div:nth-child(1) > dd').text().trim()).toBe('Bespoke condition 1')
    expect($('#bespoke-conditions-details > div:nth-child(2) > dd').text().trim()).toBe('Bespoke condition 2')
  })

  it('should show change links and submit button when licence status is IN_PROGRESS', () => {
    viewContext = {
      licence: {
        statusCode: 'IN_PROGRESS',
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.govuk-summary-list__actions').length).toBe(5)
    expect($('.check-answers-header__change-link').length).toBe(2)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(1)
  })

  it('should hide change links and submit button when licence status is not IN_PROGRESS', () => {
    viewContext = {
      licence: {
        statusCode: 'SUBMITTED',
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('.govuk-summary-list__actions').length).toBe(0)
    expect($('.check-answers-header__change-link').length).toBe(0)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(0)
  })
})
