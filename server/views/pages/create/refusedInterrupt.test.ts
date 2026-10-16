import fs from 'fs'
import config from '../../../config'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/refusedInterrupt.njk').toString())

describe('View refused interrupt page', () => {
  const model = {
    backLink: '/licence/create/caseload?view=team',
    toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
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

  it('should display the continue button and return to case list link', () => {
    const $ = render(model)
    const continueButton = $('.refused-interrupt__actions a.govuk-button')

    expect(continueButton.text().trim()).toBe('Continue')
    expect(continueButton.attr('href')).toBe(model.toCheckYourAnswer)
    expect(continueButton.attr('role')).toBe('button')
    expect(continueButton.attr('draggable')).toBe('false')

    const returnLink = $('.refused-interrupt__actions a.govuk-link')
    expect(returnLink.text().trim()).toBe('Return to case list')
    expect(returnLink.attr('href')).toBe(model.backLink)
    expect($('.govuk-back-link').attr('href')).toBe(model.backLink)
  })
})
