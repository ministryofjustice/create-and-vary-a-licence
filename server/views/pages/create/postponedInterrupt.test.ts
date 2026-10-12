import fs from 'fs'
import config from '../../../config'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/postponedInterrupt.njk').toString())

describe('View postponed interrupt page', () => {
  const model = {
    backLink: '/licence/create/caseload?search=Smith',
    toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
    omuContact: 'omu.wandsworth@justice.gov.uk',
  }

  it('should display the interruption card heading and postponed message', () => {
    const $ = render(model)

    expect($('.moj-interruption-card h1.moj-interruption-card__heading').text().trim()).toBe(
      'HDC application postponed',
    )
    expect($('.moj-interruption-card__body').text()).toContain(
      'You can continue working on this licence but it can only be submitted if the application resumes.',
    )
    expect($('.moj-interruption-card__body').text()).toContain(
      'Contact omu.wandsworth@justice.gov.uk to ask for the application to be refused if this person needs a licence for a standard release.',
    )
  })

  it('should link to the HDC service', () => {
    const $ = render(model)

    const hdcLink = $('.moj-interruption-card__body > p a')
    expect(hdcLink.text().trim()).toBe('Check the HDC service')
    expect(hdcLink.attr('href')).toBe(config.hdc.url)
    expect(hdcLink.hasClass('govuk-link')).toBe(true)
  })

  it('should display the continue button and return to case list link', () => {
    const $ = render(model)

    const continueButton = $('.postponed-interrupt__actions a.govuk-button')
    expect(continueButton.text().trim()).toBe('Continue')
    expect(continueButton.attr('href')).toBe(model.toCheckYourAnswer)
    expect(continueButton.attr('role')).toBe('button')
    expect(continueButton.attr('draggable')).toBe('false')

    const returnLink = $('.postponed-interrupt__actions a.govuk-link')
    expect(returnLink.text().trim()).toBe('Return to case list')
    expect(returnLink.attr('href')).toBe(model.backLink)
    expect($('.govuk-back-link').attr('href')).toBe(model.backLink)
  })
})
