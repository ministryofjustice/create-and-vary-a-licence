import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/confirmation.njk').toString())

describe('Hdc Confirmation', () => {
  it('should show correct message when kind is HDC', () => {
    const $ = render({
      kind: 'HDC',
    })
    expect($('#message').text().trim().toString()).toContain(
      'You can make changes to reporting instructions through the Create and vary a licence service. These changes do not need to be reapproved by the prison, but a case administrator may need to reprint the licence.',
    )

    expect($('#change-message').text().toString()).toContain(
      'To change the curfew address, curfew hours or first night curfew hours email createandvaryalicence@digital.justice.gov.uk.',
    )

    expect($('#message').text().trim().toString()).not.toContain(
      'You can do so up to 2 days before a standard release. From this point, you can only ask the prison to change the initial appointment details. Other changes must be made after release.',
    )

    expect($('#message').text().trim().toString()).not.toContain(
      'You can continue to work on licences for people being released early after the 2-day point.',
    )
  })

  it('should show correct message when kind is not HDC', () => {
    const $ = render({
      kind: 'CRD',
    })
    expect($('#message').text().trim().toString()).toContain(
      'You can do so up to 2 days before a standard release. From this point, you can only ask the prison to change the initial appointment details. Other changes must be made after release.',
    )

    expect($('#continue-message').text().trim().toString()).toContain(
      'You can continue to work on licences for people being released early after the 2-day point.',
    )

    expect($('#message').text()).not.toContain(
      'You can make changes to reporting instructions through the Create and vary a licence service. These changes do not need to be reapproved by the prison, but a case administrator may need to reprint the licence.',
    )
  })

  it('should show correct message when kind is HDC and hdcEnabled is enabled', () => {
    const $ = render({
      kind: 'HDC',
      hdcEnabled: true,
    })
    expect($('#change-message').text().toString()).toContain(
      'To request a change to the curfew address or first night curfew hours, email createandvaryalicence@digital.justice.gov.uk',
    )
  })
})
