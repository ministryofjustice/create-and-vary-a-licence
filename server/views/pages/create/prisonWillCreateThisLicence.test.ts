import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/prisonWillCreateThisLicence.njk').toString())

describe('View prison will create this licence page', () => {
  it('should display licence details for HARD_STOP', () => {
    const $ = render({
      licence: {
        crn: 'X12345',
        licenceStartDate: '01/05/2024',
        dateOfBirth: '12/02/1980',
        forename: 'John',
        surname: 'Smith',
        hardStopKind: 'HARD_STOP',
      },
      omuEmail: 'omu@example.com',
      backLink: '/licence/create/caseload',
      licenceType: 'AP_PSS',
    })

    expect($('h1').text()).toContain('Prison will create this licence')
    expect($('p.govuk-body').first().text()).toContain(
      'The prison will create a licence for this person as none was submitted in time for their final release checks.',
    )
  })

  it('should display licence details for TIME_SERVED', () => {
    const $ = render({
      licence: {
        crn: 'Y98765',
        licenceStartDate: '15/06/2024',
        dateOfBirth: '20/05/1985',
        forename: 'Jane',
        surname: 'Doe',
        hardStopKind: 'TIME_SERVED',
      },
      omuEmail: 'omu-mdi@example.com',
      backLink: '/licence/create/caseload',
      licenceType: 'PSS',
    })

    expect($('h1').text()).toContain('Prison will create this licence')
    expect($('p.govuk-body').first().text()).toContain(
      "The prison will create this person's licence because they are being released immediately following sentencing having served time on remand.",
    )
  })
})
