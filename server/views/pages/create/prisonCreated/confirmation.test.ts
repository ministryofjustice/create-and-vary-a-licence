import fs from 'fs'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/prisonCreated/confirmation.njk').toString())

describe('Prison created Confirmation', () => {
  it('should show correct message when com email is absent', () => {
    const $ = render({
      licence: { comEmail: undefined, kind: 'CRD' },
    })
    expect($('#sent-to').text().toString()).toContain(
      'Once this licence has been approved, you will need to notify the probation team. We do not have their contact details to do this automatically.',
    )
  })

  it('should show correct message when com email is present', () => {
    const $ = render({
      licence: { comEmail: 'some@email.com' },
    })
    expect($('#sent-to').text().toString()).toContain(
      'Once the licence has been approved, we will automatically email the probation team to tell them.',
    )
  })
})
