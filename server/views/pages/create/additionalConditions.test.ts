import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/create/additionalConditions.njk')

describe('Create a Licence Views - Additional Conditions', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display a heading for each condition group', () => {
    viewContext = {
      additionalConditions: [
        {
          category: 'Group 1',
          conditions: [],
        },
        {
          category: 'Group 2',
          conditions: [],
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group > fieldset > legend > h1').length).toBe(2)
    expect($('.govuk-form-group:nth-child(1) > fieldset > legend > h1').text().trim()).toBe('Group 1')
    expect($('.govuk-form-group:nth-child(2) > fieldset > legend > h1').text().trim()).toBe('Group 2')
  })

  it('should display a checkbox for each condition in a group', () => {
    viewContext = {
      additionalConditions: [
        {
          category: 'Group 1',
          conditions: [
            {
              code: 'condition1',
              text: 'conditionText1',
            },
            {
              code: 'condition2',
              text: 'conditionText2',
            },
          ],
        },
        {
          category: 'Group 2',
          conditions: [
            {
              code: 'condition3',
              text: 'conditionText3',
            },
          ],
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group:nth-child(1) input').length).toBe(2)
    expect($('.govuk-form-group:nth-child(2) input').length).toBe(1)
  })

  it('should check the checkboxes if they are present on the licence', () => {
    viewContext = {
      licence: {
        additionalConditions: [
          {
            code: 'condition1',
          },
        ],
      },
      additionalConditions: [
        {
          category: 'Group 1',
          conditions: [
            {
              code: 'condition1',
              text: 'conditionText1',
            },
            {
              code: 'condition2',
              text: 'conditionText2',
            },
          ],
        },
        {
          category: 'Group 2',
          conditions: [
            {
              code: 'condition3',
              text: 'conditionText3',
            },
          ],
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group:nth-child(1) input:nth-child(1)').attr('checked')).toBe('checked')
    expect($('.govuk-form-group:nth-child(1) input:nth-child(2)').attr('checked')).toBeUndefined()
    expect($('.govuk-form-group:nth-child(2) input:nth-child(1)').attr('checked')).toBeUndefined()
  })
})
