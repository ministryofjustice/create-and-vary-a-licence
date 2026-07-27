import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import config from '../../../config'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/confirmation.njk').toString())

describe('Confirmation page', () => {
  it('should render the confirmation page', () => {
    const $ = render({
      fullName: 'John Smith',
      prisonDescription: 'HMP Leeds',
      kind: 'CRD',
    })
    expect($('.govuk-panel__title').text().trim().toString()).toBe('Licence conditions for John Smith sent')
    expect($('#sent-to').text().trim().toString()).toBe('We have sent the licence to HMP Leeds for approval.')
    expect($('#message').text().trim().toString()).toContain('You can do so up to 2 days before a standard release.')
    expect($('#message').text().trim().toString()).toContain(
      'From this point, you can only ask the prison to change the initial appointment details. Other changes must be made after release.',
    )
  })

  it('should render different message on the confirmation page when finalThirdEnabled is true', () => {
    config.finalThirdEnabled = true
    const $ = render({
      fullName: 'John Smith',
      prisonDescription: 'HMP Leeds',
      kind: 'CRD',
    })
    expect($('.govuk-panel__title').text().trim().toString()).toBe('Licence conditions for John Smith sent')
    expect($('#sent-to').text().trim().toString()).toBe('We have sent the licence to HMP Leeds for approval.')
    expect($('#first-part-message').text().trim().toString()).toContain(
      'You can do so up to 2 days before a standard release.',
    )
    expect($('#second-part-message').text().trim().toString()).toContain(
      'From this point, you can only ask the prison to change the contact details that will be shown on the licence, for example if an initial appointment is needed. Other changes must be made after release.',
    )
  })
})

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
