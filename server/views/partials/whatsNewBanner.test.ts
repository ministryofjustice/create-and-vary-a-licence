import fs from 'fs'

import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/partials/whatsNewBanner.njk').toString())

describe('Whats new banner', () => {
  it('Show whats new banner if showCommsBanner is true', () => {
    const $ = render({
      showCommsBanner: true,
    })
    expect($('body').text()).toContain('Updates to additional licence conditions')
  })

  it('Hide whats new banner if showCommsBanner is true', () => {
    const $ = render({
      showCommsBanner: false,
    })
    expect($('body').text()).not.toContain('Updates to additional licence conditions')
  })
})
