import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  '{% from "pages/immediateReleaseConditions.njk" import immediateReleaseConditions %}{{ immediateReleaseConditions(options)}}',
)

describe('Caseload', () => {
  it('should display standard conditions text', () => {
    const $ = render({
      options: 'AP',
    })
    expect($('p').text()).toContain('By default, the licence will automatically contain the following restrictions:')

    // Check the licence conditions
    expect($('ul.standard-conditions li:nth-child(1)').text().trim()).toBe('standard conditions')
    expect($('ul.standard-conditions li:nth-child(2)').text().trim()).toBe('the following additional condition:')
    expect($('.govuk-inset-text').text().trim()).toBe(
      'Not to approach or communicate with any victims of your offences without the prior approval of your supervising officer.',
    )
  })

  it('should display post sentence supervision text', () => {
    const $ = render({
      options: 'PSS',
    })
    expect($('p').text().toString()).toContain(
      'This licence contains standard post sentence supervision requirements only by default.',
    )
  })
})
