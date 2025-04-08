import fs from 'fs'

import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/partials/getHelpAlert.njk').toString())

describe('Get help alert banner', () => {
  it('Show help banner if showGetHelpAlert is true', () => {
    const $ = render({
      showGetHelpAlert: true,
    })
    expect($('body').text()).toContain('The quickest way to get help using this service')
  })

  it('Not show help banner if showGetHelpAlert is false', () => {
    const $ = render({
      showGetHelpAlert: false,
    })
    expect($('body').text()).not.toContain('The quickest way to get help using this service')
  })
})
