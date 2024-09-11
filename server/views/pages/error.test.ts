import fs from 'fs'
import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/error.njk').toString())

describe('Error', () => {
  it('should display error page content for a NOMIS user', () => {
    const $ = render({
      user: {
        authSource: 'nomis',
      },
      serviceNowUrl: 'http://testurl1.com',
      dpsUrl: 'http://testurl2.com',
    })
    expect($('h1').text()).toContain('Sorry, there is a problem with Create and vary a licence')

    expect($('#support').text()).toContain('Go to the Digital Prison Services homepage')
    expect($('#support').text()).not.toContain('Go to the Digital Services homepage.')

    expect($('#support > .govuk-link:first-child').attr('href')).toBe('http://testurl1.com')
    expect($('#support .govuk-link:last-child').attr('href')).toBe('http://testurl2.com')
  })

  it('should display error page content for a Delius user', () => {
    const $ = render({
      user: {
        authSource: 'delius',
      },
      serviceNowUrl: 'http://testurl1.com',
    })
    expect($('h1').text()).toContain('Sorry, there is a problem with Create and vary a licence')

    expect($('#support').text()).toContain('Go to the Digital Services homepage.')
    expect($('#support').text()).not.toContain('Go to the Digital Prison Services homepage')

    expect($('#support > .govuk-link:first-child').attr('href')).toBe('http://testurl1.com')
    expect($('#support .govuk-link:last-child').attr('href')).toBe('https://sign-in.hmpps.service.justice.gov.uk/auth')
  })
})
