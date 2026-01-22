import { templateRenderer } from '../utils/__testutils/templateTestUtils'

describe('View Partials - Form builder', () => {
  const template =
    '{% from "formBuilder.njk" import formBuilder %}{{ formBuilder(licenceId, config, additionalCondition, validationErrors, formResponses, csrfToken)}}'

  const render = templateRenderer(template)

  it('should build a text input correctly', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('.govuk-form-group').length).toBe(1)
    expect($('.govuk-label').text().trim()).toBe('label for textbox')
    expect($('#textbox').length).toBe(1)
  })

  it('should build Add Another fieldsets correctly for text input', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('.govuk-form-group').length).toBe(3)
    expect($('#textbox\\[0\\]').attr('value')).toBe('Data 1')
    expect($('#textbox\\[1\\]').attr('value')).toBe('Data 2')
    expect($('#textbox\\[2\\]').attr('value')).toBe('Data 3')
    expect($('.moj-add-another__remove-button').length).toBe(3)
    expect($('.moj-button-action > .moj-add-another__add-button').length).toBe(1)
  })

  it('should only build the first occurring input value if field is not addAnother enabled', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('.govuk-form-group').length).toBe(1)
    expect($('#textbox').attr('value')).toBe('Data 1')
    expect($('.moj-add-another__remove-button').length).toBe(0)
    expect($('.moj-button-action > .moj-add-another__add-button').length).toBe(0)
  })

  it('should build a dropdown input correctly', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

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
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('.govuk-form-group').length).toBe(1)
    expect($('.govuk-fieldset__legend').text().trim()).toBe('label for radio')
    expect($('.govuk-radios__item').length).toBe(2)
    expect($('.govuk-radios__item:nth-child(1) > label').text().trim()).toBe('option1')
    expect($('.govuk-radios__item:nth-child(2) > label').text().trim()).toBe('option2')
  })

  it('should build a conditional reveal input correctly', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('.govuk-form-group').length).toBe(2)
    expect($('.govuk-fieldset__legend').first().text().trim()).toBe('label for radio')
    expect($('.govuk-radios__item').length).toBe(2)
    expect($('.govuk-radios__item:nth-child(1) > label').text().trim()).toBe('option1')
    expect($('.govuk-radios__item:nth-child(2) > label').text().trim()).toBe('option2')
    expect($('#conditional-radioButton-2 label').text().trim()).toBe('Conditional Textbox')
  })

  it('should build a date picker input correctly', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('.govuk-date-input').length).toBe(1)
    expect($('#datePicker1').length).toBe(1)
    expect($('legend').text().trim()).toBe('Date Label')
    expect($('label').length).toBe(3)
    expect($('#datePicker1 > div:nth-child(1) > div > label').text().trim()).toBe('Day')
    expect($('#datePicker1 > div:nth-child(2) > div > label').text().trim()).toBe('Month')
    expect($('#datePicker1 > div:nth-child(3) > div > label').text().trim()).toBe('Year')
  })

  it('should build a time picker input correctly', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('.govuk-date-input').length).toBe(1)
    expect($('#timePicker1').length).toBe(1)
    expect($('legend').text().trim()).toBe('Time Label')
    expect($('label').length).toBe(3)
    expect($('#timePicker1 > div:nth-child(1) > div > label').text().trim()).toBe('Hour')
    expect($('#timePicker1 > div:nth-child(2) > div > label').text().trim()).toBe('Minute')
    expect($('#timePicker1 > div:nth-child(3) > div > label').text().trim()).toBe('am or pm')
  })

  it('should build an address input correctly', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('#addressLine1').length).toBe(1)
    expect($('#addressLine2').length).toBe(1)
    expect($('#addressTown').length).toBe(1)
    expect($('#addressCounty').length).toBe(1)
    expect($('#addressPostcode').length).toBe(1)
  })

  it('should build a checkbox input correctly', () => {
    const $ = render({
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
      csrfToken: 'not-real',
    })

    expect($('#check').length).toBe(1)
    expect($('#check-2').length).toBe(1)
    expect($('div:nth-child(1) > label').text().trim()).toBe('option1')
    expect($('div:nth-child(2) > label').text().trim()).toBe('option2')
  })

  it('should build a file upload type correctly', () => {
    const $ = render({
      formResponses: [],
      additionalCondition: {
        data: [],
      },
      config: {
        inputs: [
          {
            type: 'fileUpload',
            label: 'label for file upload',
            name: 'file',
          },
        ],
      },
      csrfToken: 'not-real',
    })

    expect($('.govuk-form-group').length).toBe(1)
    expect($('.govuk-label').text().trim()).toBe('label for file upload')
    expect($('.govuk-file-upload').length).toBe(1)
  })

  it('should apply the normalizedFilename filter when rendering uploaded file metadata', () => {
    const $ = render({
      formResponses: null,
      csrfToken: 'not-real',
      additionalCondition: {
        uploadSummary: [{ thumbnailImage: 'thumb.jpg' }],
        data: [
          {
            id: 1,
            field: 'outOfBoundFilename',
            value: 'uploaded.pdf',
            sequence: 1,
            contributesToLicence: true,
          },
        ],
      },
      config: {
        inputs: [
          {
            type: 'fileUpload',
            label: 'label for file upload',
            name: 'outOfBoundFilename',
          },
        ],
      },
    })

    const hiddenInput = $('input[type="hidden"][name="filename"]')

    expect(hiddenInput.length).toBe(1)
    expect(hiddenInput.attr('value')).toBe('uploaded.pdf')
  })
})
