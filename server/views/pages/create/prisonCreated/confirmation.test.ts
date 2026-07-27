import fs from 'fs'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import config from '../../../../config'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/prisonCreated/confirmation.njk').toString())

describe('Prison created Confirmation', () => {
  it('should show correct change message when submitting for approval', () => {
    const $ = render({
      licence: { comEmail: 'test@test.com', kind: 'CRD' },
    })
    expect($('#message').text().toString()).toContain(
      'Only the initial appointment can be changed. For example, because a probation practitioner requests a different date or time. You can return to the service to edit this after it has been sent or approved.',
    )
    expect($('#message').text().toString()).toContain('The licence will not need to be approved again.')
  })
  it('should show correct change message when final third is enabled', () => {
    config.finalThirdEnabled = true
    const $ = render({
      licence: { comEmail: 'test@test.com', kind: 'CRD' },
    })
    expect($('#message').text().toString()).toContain(
      'Only the contact details that will be shown on the licence can be changed, for example if an initial appointment is needed. You can return to the service to edit this after the licence has been sent or approved.',
    )
    expect($('#message').text().toString()).toContain('The licence will not need to be approved again.')
  })
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
