import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary-approve/approved.njk').toString())

describe('Vary approve approved page', () => {
  it('should render offender name in title case in the panel title', () => {
    const $ = render({
      licence: {
        forename: 'hAle',
        surname: 'cORvAth',
      },
      applicationName: 'Create and vary a licence',
    })

    expect($('.govuk-panel__title').text()).toContain('Variation for Hale Corvath approved')
  })

  it('should render offender name in title case in the confirmation message', () => {
    const $ = render({
      licence: {
        forename: 'hAle',
        surname: 'dRAVEN cORvAth',
      },
      applicationName: 'Create and vary a licence',
    })

    expect($('#sent-to').text()).toContain(
      'The variation for Hale Draven Corvath has been approved with your digital signature.',
    )
  })

  it('should render offender name without undefined when surname is missing', () => {
    const $ = render({
      licence: {
        forename: 'hAle',
      },
      applicationName: 'Create and vary a licence',
    })

    expect($('.govuk-panel__title').text()).toContain('Variation for Hale approved')
    expect($('#sent-to').text()).toContain('The variation for Hale has been approved with your digital signature.')
  })

  it('should render print and issue licence guidance', () => {
    const $ = render({
      licence: {
        forename: 'Hale',
        surname: 'Corvath',
      },
      applicationName: 'Create and vary a licence',
    })

    expect($('.govuk-body').text()).toContain('They can then print and issue the licence.')
  })
})
