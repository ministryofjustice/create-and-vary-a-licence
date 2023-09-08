import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Form Error', () => {
  const render = templateRenderer('{% include "partials/formError.njk" %}')
  it('should not show error summary if no errors exist', () => {
    const $ = render({
      errorSummaryList: [],
    })

    expect($('.govuk-error-summary').length).toBe(0)
  })

  it('should display error summary when errors exist', () => {
    const $ = render({
      validationErrors: [
        {
          field: 'field',
          message: 'Error',
        },
      ],
    })

    expect($('.govuk-error-summary__list > li').length).toBe(1)
    expect($('.govuk-error-summary__list > li > a').text()).toBe('Error')
  })
})
