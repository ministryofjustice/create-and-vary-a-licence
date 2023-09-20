import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Header', () => {
  const render = templateRenderer('{% include "partials/header.njk" %}')

  it('should include user information when user is provided in context', () => {
    const $ = render({
      user: {
        displayName: 'John Smith',
      },
    })

    expect($('[data-qa="header-user-name"]').text().trim()).toBe('J. Smith')
  })

  it('should not include user information when user is not provided in context', () => {
    const $ = render({})

    expect($('[data-qa="header-user-name"]').text().trim()).toBe('')
  })
})
