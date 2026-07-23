import fs from 'fs'

import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/partials/whatsNewBanner.njk').toString())

describe('Whats new banner', () => {
  it('Show whats new banner if showCommsBanner is true', () => {
    const $ = render({
      showCommsBanner: true,
    })
    expect($('body').text()).toContain('Upcoming changes to licence conditions')
    expect($('body').text()).toContain(
      'Standard and additional licence conditions are changing for people being released on or after 2 September 2026.',
    )
    expect($('body').text()).toContain(
      'Probation practitioners can start using the new additional conditions for these people from 27 July 2026. Standard conditions for anyone released on or after 2 September will be updated automatically.',
    )
  })

  it('Hide whats new banner if showCommsBanner is false', () => {
    const $ = render({
      showCommsBanner: false,
    })
    expect($('body').text()).not.toContain(`Upcoming changes to licence conditions`)
  })

  it('Show whats new banner with probation staff message if isProbationStaff is true', () => {
    const $ = render({
      showCommsBanner: true,
      isProbationUser: true,
    })
    expect($('body').text()).toContain('Upcoming changes to licence conditions')
    expect($('body').text()).toContain(
      'Probation practitioners can start using the new additional conditions for these people from 27 July 2026. The new additional conditions will be available when varying licences from 2 September.',
    )
    expect($('body').text()).toContain(
      'Standard conditions for anyone released on or after 2 September will be updated automatically.',
    )
  })
})
