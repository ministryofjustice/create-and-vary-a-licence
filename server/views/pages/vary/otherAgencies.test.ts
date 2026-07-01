import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/otherAgencies.njk').toString())

describe('Other agencies', () => {
  it('should display the interrupt card', () => {
    const $ = render({
      licence: {
        id: 3,
      },
    })
    expect($('.moj-interruption-card__heading').text()).toContain('Send the new licence to other agencies')
    expect($('.moj-interruption-card__actions a').attr('href')).toContain('/licence/vary/id/3/timeline')
  })
})
