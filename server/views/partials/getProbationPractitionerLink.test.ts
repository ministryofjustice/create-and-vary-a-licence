import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Probation Practitioner Link', () => {
  it('renders link with name when name is provided', () => {
    // Given
    const allocated = true
    const name = 'Joe Bloggs'
    const licenceId = 123

    // When
    const $ = renderLink({ allocated, name, licenceId })

    // Then
    const link = $('a.govuk-link')
    expect(link.text().trim()).toBe('Joe Bloggs')
    expect(link.attr('href')).toBe('/licence/approve/id/123/probation-practitioner')
  })

  it('renders "Not allocated" when allocated=false', () => {
    // Given
    const allocated = false
    const name = 'Not allocated'
    const licenceId = 999

    // When
    const $ = renderLink({ allocated, name, licenceId })

    // Then
    expect($.text().trim()).toBe('Not allocated')
  })

  it('escapes names correctly', () => {
    // Given
    const allocated = true
    const name = '<b>Bad stuff</b>'
    const licenceId = 321

    // When
    const $ = renderLink({ allocated, name, licenceId })

    // Then
    const link = $('a.govuk-link')
    expect(link.html()).toContain('&lt;b&gt;Bad stuff&lt;/b&gt;')
  })

  const renderLink = templateRenderer(
    `{% from "partials/getProbationPractitionerLink.njk" import getProbationPractitionerLink %}
     {{ getProbationPractitionerLink(allocated, name, licenceId) }}`,
  )
})
