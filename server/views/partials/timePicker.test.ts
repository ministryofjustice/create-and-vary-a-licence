import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Time Picker', () => {
  const render = templateRenderer('{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}')

  it('should show label when label is provided in context', () => {
    const $ = render({
      options: {
        id: 'id',
        label: {
          text: 'Label',
        },
      },
    })

    expect($('legend').text().trim()).toBe('Label')
  })

  it('should not show label when label is not provided in context', () => {
    const $ = render({
      options: {
        id: 'id',
      },
    })

    expect($('legend').length).toBe(0)
  })

  it('should show hint when hint is provided in context', () => {
    const $ = render({
      options: {
        hint: {
          text: 'Hint',
        },
      },
    })

    expect($('.govuk-hint').text().trim()).toBe('Hint')
  })

  it('should not show hint when hint is not provided in context', () => {
    const $ = render({
      options: {},
    })

    expect($('.govuk-hint').length).toBe(0)
  })

  it('should add error class to form group if error exists', () => {
    const $ = render({
      options: {
        errorMessage: {
          text: 'error',
        },
      },
    })

    expect($('.govuk-form-group').attr('class')).toContain('govuk-form-group--error')
  })

  it('should not add error class to form group when error does not exist', () => {
    const $ = render({
      options: {},
    })

    expect($('.govuk-form-group').attr('class')).not.toContain('govuk-form-group--error')
  })

  it('should display error span if error exists', () => {
    const $ = render({
      options: {
        errorMessage: {
          text: 'error',
        },
      },
    })

    expect($('.govuk-error-message').length).toBe(1)
    expect($('.govuk-error-message > span:nth-child(2)').text().trim()).toBe('error')
  })

  it('should not display error span when error does not exist', () => {
    const $ = render({
      options: {},
    })

    expect($('.govuk-error-message').length).toBe(0)
  })

  it('should mark PM time option as selected when AM is in the form response', () => {
    const $ = render({
      options: {
        id: 'timePicker',
        formResponses: {
          ampm: 'pm',
        },
      },
    })

    expect($('#timePicker-ampm > option:nth-child(1)').attr('selected')).toBeUndefined()
    expect($('#timePicker-ampm > option:nth-child(2)').attr('selected')).toBeUndefined()
    expect($('#timePicker-ampm > option:nth-child(3)').attr('selected')).toBe('selected')
  })

  it('should mark AM time option as selected when AM is in the form response', () => {
    const $ = render({
      options: {
        id: 'timePicker',
        formResponses: {
          ampm: 'am',
        },
      },
    })

    expect($('#timePicker-ampm > option:nth-child(1)').attr('selected')).toBeUndefined()
    expect($('#timePicker-ampm > option:nth-child(2)').attr('selected')).toBe('selected')
    expect($('#timePicker-ampm > option:nth-child(3)').attr('selected')).toBeUndefined()
  })

  it('should not mark either time option as selected when timePicker is not in the form response', () => {
    const $ = render({
      options: {
        id: 'timePicker',
        formResponses: {},
      },
    })

    expect($('#timePicker-ampm > option:nth-child(1)').attr('selected')).toBeUndefined()
    expect($('#timePicker-ampm > option:nth-child(2)').attr('selected')).toBeUndefined()
  })

  it('should add error class to inputs when an error is present', () => {
    const $ = render({
      options: {
        id: 'timePicker',
        errorMessage: {
          text: 'error',
        },
      },
    })

    expect($('#timePicker-hour').hasClass('govuk-input--error')).toBe(true)
    expect($('#timePicker-minute').hasClass('govuk-input--error')).toBe(true)
    expect($('#timePicker-ampm').hasClass('govuk-select--error')).toBe(true)
  })

  it('should not add error class to inputs when an error is not present', () => {
    const $ = render({
      options: {
        id: 'timePicker',
      },
    })

    expect($('#timePicker-hour').hasClass('govuk-input--error')).toBe(false)
    expect($('#timePicker-minute').hasClass('govuk-input--error')).toBe(false)
    expect($('#timePicker-ampm').hasClass('govuk-select--error')).toBe(false)
  })
})
