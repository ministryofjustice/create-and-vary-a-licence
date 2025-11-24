import fs from 'fs'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/hardStop/confirmation.njk').toString())

describe('Hardstop Confirmation', () => {
  it('should show correct message when com email is absent', () => {
    const $ = render({
      licence: { comEmail: undefined },
    })
    expect($('#sent-to').text().toString()).toContain(
      'Once this licence has been approved, you will need to notify the probation team. We do not have their contact details to do this automatically.',
    )
    expect($('.govuk-panel__body').length).toEqual(1)
    expect($('.govuk-panel__body').text().toString()).toContain('You still need to contact the probation team')
  })

  it('should show correct message when com email is present', () => {
    const $ = render({
      licence: { comEmail: 'some@email.com' },
    })
    expect($('#sent-to').text().toString()).toContain(
      'Once the licence has been approved, we will automatically email the probation team to tell them.',
    )
    expect($('.govuk-panel__body').length).toEqual(0)
  })

  it('should not show com email message for time served licences', () => {
    const $ = render({
      licence: { comEmail: 'some@email.com', kind: 'TIME_SERVED' },
    })
    expect($('#sent-to').length).toEqual(0)
    expect($('.govuk-panel__body').length).toEqual(0)
  })
})
