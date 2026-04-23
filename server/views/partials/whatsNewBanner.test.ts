import fs from 'fs'

import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/partials/whatsNewBanner.njk').toString())

describe('Whats new banner', () => {
  it('Show whats new banner if showCommsBanner is true', () => {
    const $ = render({
      showCommsBanner: true,
    })
    expect($('body').text()).toContain("What's new")
    expect($('body').text()).toContain(
      'From 28 April 2026, this service can be used to produce licences for people being released following a standard recall and PD1s will no longer need to be sent for these cases.',
    )
    expect($('body').text()).toContain(
      'If no licence has been submitted by 2 days before release, the prison can generate one.',
    )
  })

  it('Show whats new banner with probation staff message if isProbationStaff is true', () => {
    const $ = render({
      showCommsBanner: true,
      isProbationStaff: true,
    })
    expect($('body').text()).toContain("What's new")
    expect($('body').text()).toContain(
      'From 28 April 2026, probation practitioners will be able to use this service to produce licences for people being released following a standard recall.',
    )
    expect($('body').text()).toContain('All licences must be submitted by 2 days before release.')
  })

  it('Hide whats new banner if showCommsBanner is false', () => {
    const $ = render({
      showCommsBanner: false,
    })
    expect($('body').text()).not.toContain("What's new")
  })
})
