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
          groupName: 'Group 1',
          conditions: [],
        },
        {
          groupName: 'Group 2',
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
          groupName: 'Group 1',
          conditions: [
            {
              id: 'condition1',
              text: 'conditionText1',
            },
            {
              id: 'condition2',
              text: 'conditionText2',
            },
          ],
        },
        {
          groupName: 'Group 2',
          conditions: [
            {
              id: 'condition3',
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

  it('should check the checkboxes if they are selected in the form response object', () => {
    viewContext = {
      formResponses: {
        additionalConditions: ['condition1'],
      },
      additionalConditions: [
        {
          groupName: 'Group 1',
          conditions: [
            {
              id: 'condition1',
              text: 'conditionText1',
            },
            {
              id: 'condition2',
              text: 'conditionText2',
            },
          ],
        },
        {
          groupName: 'Group 2',
          conditions: [
            {
              id: 'condition3',
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

  it('should nest conditional inputs if inputTemplate is provided for condition', () => {
    viewContext = {
      formResponses: {
        additionalConditions: ['condition1'],
      },
      additionalConditions: [
        {
          groupName: 'Group 1',
          conditions: [
            {
              id: 'condition1',
              text: 'conditionText1',
              inputTemplate: 'template1',
            },
          ],
        },
        {
          groupName: 'Group 2',
          conditions: [
            {
              id: 'condition2',
              text: 'conditionText2',
            },
          ],
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group:nth-child(1) > fieldset > div > .govuk-checkboxes__conditional').length).toBe(1)
    expect($('.govuk-form-group:nth-child(2) > fieldset > div > .govuk-checkboxes__conditional').length).toBe(0)
  })
})
