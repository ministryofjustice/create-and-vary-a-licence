import fs from 'fs'
import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('Access restricted in Delius', () => {
  const render = templateRenderer(fs.readFileSync('server/views/pages/accessRestrictedDelius.njk').toString())

  it('should show the reason for the restriction', () => {
    const $ = render({
      user: {
        userRoles: 'a role',
      },
      caseAccessDetails: {
        crn: 'crn1234',
        type: 'RESTRICTED',
        message: 'some reason',
      },
    })

    expect($('h1').text()).toContain('Access restricted on NDelius')
    expect($('.govuk-inset-text').text()).toContain('some reason')
    expect($('[data-qa="equip-link"]').attr('href')).toContain(
      'https://equip-portal.equip.service.justice.gov.uk/ctrlwebisapi.dll/app/diagram/0%3AFF2D8D3F16B44268B814F7F8177A16F7.0CCF9118DFAC43F697E66CE331889D60',
    )
    expect($('[data-qa="return-to-cases"]').attr('href')).toContain('/licence/create/caseload')
  })
})
