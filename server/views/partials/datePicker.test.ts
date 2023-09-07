import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Date Picker', () => {
  const render = templateRenderer('{% from "partials/datePicker.njk" import datePicker %}{{ datePicker(options)}}')

  it('should add error class to inputs when an error is present', () => {
    const $ = render({
      options: {
        id: 'datePicker',
        errorMessage: {
          text: 'error',
        },
      },
    })

    expect($('#datePicker-day').hasClass('govuk-input--error')).toBe(true)
    expect($('#datePicker-month').hasClass('govuk-input--error')).toBe(true)
    expect($('#datePicker-year').hasClass('govuk-input--error')).toBe(true)
  })

  it('should not add error class to inputs when an error is not present', () => {
    const $ = render({
      options: {
        id: 'datePicker',
      },
    })

    expect($('#datePicker-day').hasClass('govuk-input--error')).toBe(false)
    expect($('#datePicker-month').hasClass('govuk-input--error')).toBe(false)
    expect($('#datePicker-year').hasClass('govuk-input--error')).toBe(false)
  })
})
