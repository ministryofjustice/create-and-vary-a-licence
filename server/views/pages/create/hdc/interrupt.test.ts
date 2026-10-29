import fs from 'fs'
import config from '../../../../config'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/hdc/interrupt.njk').toString())

describe('View HDC interrupt page', () => {
  const model = {
    backLink: '/licence/create/caseload?view=team',
    toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
    interruptType: 'refused',
  }

  it('should display the refused heading and standard release message', () => {
    const $ = render(model)

    expect($('.moj-interruption-card h1').text().trim()).toBe('HDC application refused')
    expect($('.moj-interruption-card__body > p').first().text().trim()).toBe(
      'This licence is now for a standard release.',
    )
    expect($('.moj-interruption-card__body > p').eq(1).text().trim()).toBe(
      'Check the HDC service for more information about the HDC application.',
    )
  })

  it('should link to the HDC front page', () => {
    const $ = render(model)
    const hdcLink = $('.moj-interruption-card__body > p a')

    expect(hdcLink.text().trim()).toBe('Check the HDC service')
    expect(hdcLink.attr('href')).toBe(config.hdc.url)
  })

  it('should display the Continue button and return to case list link', () => {
    const $ = render(model)
    const continueButton = $('.refused-interrupt__actions a.govuk-button')

    expect(continueButton.text().trim()).toBe('Continue')
    expect(continueButton.attr('href')).toBe(model.toCheckYourAnswer)

    const returnLink = $('.refused-interrupt__actions a.govuk-link')
    expect(returnLink.text().trim()).toBe('Return to case list')
    expect(returnLink.attr('href')).toBe(model.backLink)
    expect($('.govuk-back-link').attr('href')).toBe(model.backLink)
  })

  it('should block continuing to licence details when address checks are incomplete', () => {
    const $ = render({ ...model, interruptType: 'addressChecksIncomplete' })

    expect($('.moj-interruption-card h1').text().trim()).toBe('This person has opted in to HDC')
    expect($('.moj-interruption-card__body > p').first().text().trim()).toBe(
      'You must complete the address checks in HDC before you can continue with this licence in CVL.',
    )
    expect($('.refused-interrupt__actions a.govuk-button').length).toBe(0)
    expect($('.refused-interrupt__actions a.govuk-link').text().trim()).toBe('Return to case list')
  })

  it('should display the opted-out interruption', () => {
    const $ = render({ ...model, interruptType: 'optOut' })

    expect($('.moj-interruption-card h1').text().trim()).toBe('This person has opted out of HDC')
    expect($('.moj-interruption-card__body > p').first().text().trim()).toBe(
      'This licence is now for a standard release.',
    )
  })

  it('should display the postponed interruption and OMU contact', () => {
    const $ = render({ ...model, interruptType: 'postponed', omuContact: 'omu@example.test' })

    expect($('.moj-interruption-card h1').text().trim()).toBe('HDC application postponed')
    expect($('.moj-interruption-card__body').text()).toContain(
      'You can continue working on this licence but it can only be submitted if the application resumes.',
    )
    expect($('.moj-interruption-card__body').text()).toContain(
      'Contact omu@example.test to ask for the application to be refused if this person needs a licence for a standard release.',
    )
  })
})
