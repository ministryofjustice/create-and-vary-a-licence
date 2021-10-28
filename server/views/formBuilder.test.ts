import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import fs from 'fs'
import { registerNunjucks } from '../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/formBuilder.njk')

describe('View Partials - Form builder', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should build a text input correctly', () => {
    viewContext = {
      formResponses: [],
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'text',
            label: 'label for textbox',
            name: 'textbox',
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group').length).toBe(1)
    expect($('.govuk-label').text().trim()).toBe('label for textbox')
    expect($('#textbox').length).toBe(1)
  })

  it('should build a radio input correctly', () => {
    viewContext = {
      formResponses: [],
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'radio',
            label: 'label for radio',
            name: 'radio buttons',
            options: [
              {
                value: 'option1',
              },
              {
                value: 'option2',
              },
            ],
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group').length).toBe(1)
    expect($('.govuk-fieldset__legend').text().trim()).toBe('label for radio')
    expect($('.govuk-radios__item').length).toBe(2)
    expect($('.govuk-radios__item:nth-child(1) > label').text().trim()).toBe('option1')
    expect($('.govuk-radios__item:nth-child(2) > label').text().trim()).toBe('option2')
  })

  it('should build a date picker input correctly', () => {
    viewContext = {
      formResponses: [],
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'datePicker',
            name: 'datePicker1',
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-date-input').length).toBe(1)
    expect($('#datePicker1').length).toBe(1)
    expect($('label').length).toBe(3)
    expect($('#datePicker1 > div:nth-child(1) > div > label').text().trim()).toBe('Day')
    expect($('#datePicker1 > div:nth-child(2) > div > label').text().trim()).toBe('Month')
    expect($('#datePicker1 > div:nth-child(3) > div > label').text().trim()).toBe('Year')
  })

  it('should build a time picker input correctly', () => {
    viewContext = {
      formResponses: [],
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'timePicker',
            name: 'timePicker1',
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-date-input').length).toBe(1)
    expect($('#timePicker1').length).toBe(1)
    expect($('label').length).toBe(4)
    expect($('#timePicker1-label').text().trim()).toBe('Time')
    expect($('#timePicker1 > div:nth-child(1) > div > label').text().trim()).toBe('Hour')
    expect($('#timePicker1 > div:nth-child(2) > div > label').text().trim()).toBe('Minute')
    expect($('#timePicker1 > div:nth-child(3) > div > label').text().trim()).toBe('am or pm')
  })
})
