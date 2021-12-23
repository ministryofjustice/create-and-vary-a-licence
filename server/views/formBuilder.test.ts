import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../utils/nunjucksSetup'

describe('View Partials - Form builder', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()
  const nunjucksString =
    '{% from "formBuilder.njk" import formBuilder %}{{ formBuilder(licenceId, config, additionalCondition, validationErrors, formResponses)}}'

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    viewContext = {}
  })

  it('should build a text input correctly', () => {
    viewContext = {
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

  it('should build Add Another fieldsets correctly for text input', () => {
    viewContext = {
      additionalCondition: {
        data: [
          {
            field: 'textbox',
            value: 'Data 1',
          },
          {
            field: 'textbox',
            value: 'Data 2',
          },
          {
            field: 'textbox',
            value: 'Data 3',
          },
        ],
      },
      config: {
        inputs: [
          {
            type: 'text',
            label: 'label for textbox',
            name: 'textbox',
            addAnother: {
              label: 'Add another textbox',
            },
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group').length).toBe(3)
    expect($('#textbox\\[0\\]').attr('value')).toBe('Data 1')
    expect($('#textbox\\[1\\]').attr('value')).toBe('Data 2')
    expect($('#textbox\\[2\\]').attr('value')).toBe('Data 3')
    expect($('.moj-add-another__remove-button').length).toBe(3)
    expect($('.moj-button-action > .moj-add-another__add-button').length).toBe(1)
  })

  it('should only build the first occurring input value if field is not addAnother enabled', () => {
    viewContext = {
      additionalCondition: {
        data: [
          {
            field: 'textbox',
            value: 'Data 1',
          },
          {
            field: 'textbox',
            value: 'Data 2',
          },
          {
            field: 'textbox',
            value: 'Data 3',
          },
        ],
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
    expect($('#textbox').attr('value')).toBe('Data 1')
    expect($('.moj-add-another__remove-button').length).toBe(0)
    expect($('.moj-button-action > .moj-add-another__add-button').length).toBe(0)
  })

  it('should build a dropdown input correctly', () => {
    viewContext = {
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'dropdown',
            label: 'label for dropdown',
            name: 'dropdownBox',
            options: [
              {
                value: 'option 1',
              },
              {
                value: 'option 2',
              },
            ],
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group').length).toBe(1)
    expect($('.govuk-label').text().trim()).toBe('label for dropdown')
    expect($('#dropdownBox').length).toBe(1)
    expect($('#dropdownBox').prop('tagName')).toBe('SELECT')
    expect($('option').length).toBe(3)
    expect($('option:nth-child(1)').text().trim()).toBe('-')
    expect($('option:nth-child(2)').text().trim()).toBe('option 1')
    expect($('option:nth-child(3)').text().trim()).toBe('option 2')
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
            name: 'radioButton',
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

  it('should build a conditional reveal input correctly', () => {
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
            name: 'radioButton',
            options: [
              {
                value: 'option1',
              },
              {
                value: 'option2',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Conditional Textbox',
                      name: 'conditionalReveal',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group').length).toBe(2)
    expect($('.govuk-fieldset__legend').first().text().trim()).toBe('label for radio')
    expect($('.govuk-radios__item').length).toBe(2)
    expect($('.govuk-radios__item:nth-child(1) > label').text().trim()).toBe('option1')
    expect($('.govuk-radios__item:nth-child(2) > label').text().trim()).toBe('option2')
    expect($('#conditional-radioButton-2 label').text().trim()).toBe('Conditional Textbox')
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
            label: 'Date Label',
            name: 'datePicker1',
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-date-input').length).toBe(1)
    expect($('#datePicker1').length).toBe(1)
    expect($('legend').text().trim()).toBe('Date Label')
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
            label: 'Time Label',
            name: 'timePicker1',
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-date-input').length).toBe(1)
    expect($('#timePicker1').length).toBe(1)
    expect($('legend').text().trim()).toBe('Time Label')
    expect($('label').length).toBe(3)
    expect($('#timePicker1 > div:nth-child(1) > div > label').text().trim()).toBe('Hour')
    expect($('#timePicker1 > div:nth-child(2) > div > label').text().trim()).toBe('Minute')
    expect($('#timePicker1 > div:nth-child(3) > div > label').text().trim()).toBe('am or pm')
  })

  it('should build an address input correctly', () => {
    viewContext = {
      formResponses: [],
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'address',
            name: 'address1',
          },
        ],
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#addressLine1').length).toBe(1)
    expect($('#addressLine2').length).toBe(1)
    expect($('#addressTown').length).toBe(1)
    expect($('#addressCounty').length).toBe(1)
    expect($('#addressPostcode').length).toBe(1)
  })

  it('should build a checkbox input correctly', () => {
    viewContext = {
      formResponses: [],
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'check',
            name: 'check',
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

    expect($('#check').length).toBe(1)
    expect($('#check-2').length).toBe(1)
    expect($('div:nth-child(1) > label').text().trim()).toBe('option1')
    expect($('div:nth-child(2) > label').text().trim()).toBe('option2')
  })
})
