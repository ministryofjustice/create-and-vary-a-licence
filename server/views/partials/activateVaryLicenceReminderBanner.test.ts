import fs from 'fs'

import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/partials/activatingLicenceAfterVariationReminderBanner.njk').toString()
)

describe('Activating licence after variation reminder banner', () => {
  it('Show reminder banner if shouldShowActivateVaryLicenceReminderBanner is true', () => {
    const $ = render({
      shouldShowActivateVaryLicenceReminderBanner: true,
    })
    expect($('body').text()).toContain('Varying and reviewing licences')
  })

  it('Hide reminder banner if shouldShowActivateVaryLicenceReminderBanner is true', () => {
    const $ = render({
      shouldShowActivateVaryLicenceReminderBanner: false,
    })
    expect($('body').text()).not.toContain('Varying and reviewing licences')
  })
})
