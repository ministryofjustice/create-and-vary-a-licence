import fs from 'fs'

import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/partials/whatsNewBanner.njk').toString())

describe('Whats new banner', () => {
  it('Show whats new banner if showCommsBanner is true', () => {
    const $ = render({
      showCommsBanner: true,
    })
    expect($('body').text()).toContain("What's new")
  })

  it('Hide whats new banner if showCommsBanner is false', () => {
    const $ = render({
      showCommsBanner: false,
    })
    expect($('body').text()).not.toContain("What's new")
  })

  it('Shows correct message for nomis user', () => {
    const $ = render({
      showCommsBanner: true,
      user: {
        authSource: 'nomis',
      },
    })
    expect($('body').text()).toContain(
      'If no licence has been submitted by 2 days before release, the prison can generate one.',
    )
  })

  it('Shows correct message for delius user', () => {
    const $ = render({
      showCommsBanner: true,
      user: {
        authSource: 'delius',
      },
    })
    expect($('body').text()).toContain('All licences must be submitted by 2 days before release.')
  })
})
