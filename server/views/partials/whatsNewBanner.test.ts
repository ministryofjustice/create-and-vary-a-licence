import fs from 'fs'

import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/partials/whatsNewBanner.njk').toString())

describe('Whats new banner', () => {
  it('Show whats new banner if showCommsBanner is true', () => {
    const $ = render({
      showCommsBanner: true,
    })
    expect($('body').text()).toContain(`What's new`)
    expect($('body').text()).toContain(
      'From 1 June 2026, licences for people who are detained in a secure hospital can be created and managed using this service.',
    )
  })

  it('Hide whats new banner if showCommsBanner is false', () => {
    const $ = render({
      showCommsBanner: false,
    })
    expect($('body').text()).not.toContain(`What's new`)
  })
})
