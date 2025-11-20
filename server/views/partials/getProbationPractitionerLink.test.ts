import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Probation Practitioner Link', () => {
  it('renders link with name when name is provided', () => {
    // Given
    const name = 'Joe Bloggs'
    const licenceId = 123
    const isTimeServed = false

    // When
    const $ = renderLink({ name, licenceId, isTimeServed })

    // Then
    const link = $('a.govuk-link')
    expect(link.text().trim()).toBe('Joe Bloggs')
    expect(link.attr('href')).toBe('/licence/approve/id/123/probation-practitioner')
  })

  it('renders "Not allocated yet" when no name and isTimeServed=true', () => {
    // Given
    const name: string = null
    const licenceId = 999
    const isTimeServed = true

    // When
    const $ = renderLink({ name, licenceId, isTimeServed })

    // Then
    expect($.text().trim()).toBe('Not allocated yet')
  })

  it('renders "Not allocated" when no name and isTimeServed=false', () => {
    // Given
    const name: string = null
    const licenceId = 999
    const isTimeServed = false

    // When
    const $ = renderLink({ name, licenceId, isTimeServed })

    // Then
    expect($.text().trim()).toBe('Not allocated')
  })

  it('escapes names correctly', () => {
    // Given
    const name = '<b>Bad stuff</b>'
    const licenceId = 321

    // When
    const $ = renderLink({ name, licenceId, isTimeServed: false })

    // Then
    const link = $('a.govuk-link')
    expect(link.html()).toContain('&lt;b&gt;Bad stuff&lt;/b&gt;')
  })

  const renderLink = templateRenderer(
    `{% from "partials/getProbationPractitionerLink.njk" import getProbationPractitionerLink %}
     {{ getProbationPractitionerLink(name, licenceId, isTimeServed) }}`,
  )
})
