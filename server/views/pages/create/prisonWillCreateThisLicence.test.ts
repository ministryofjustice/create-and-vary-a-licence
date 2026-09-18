import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/prisonWillCreateThisLicence.njk').toString())

describe('View prison will create this licence page', () => {
  it('should display licence details for HARD_STOP', () => {
    const prisonName = 'HMP Example'
    const $ = render({
      licence: {
        crn: 'X12345',
        licenceStartDate: '01/05/2024',
        dateOfBirth: '12/02/1980',
        forename: 'John',
        surname: 'Smith',
        isTimeServed: false,
      },
      prisonName,
      omuEmail: 'omu@example.com',
      backLink: '/licence/create/caseload',
      licenceType: 'AP',
    })

    expect($('h1').text()).toContain('Prison will create this licence')
    expect($('p.govuk-body').first().text()).toContain(
      `${prisonName} will create a licence for this person as none was submitted in time for their final release checks.`,
    )
    expect($('.govuk-details__summary-text').text()).toContain('When no initial appointment is needed')
    expect($('#licence-review-warning').text()).toContain(
      'This licence must be reviewed after this person is released.',
    )
  })

  it('should display licence details for TIME_SERVED', () => {
    const prisonName = 'HMP Example'
    const $ = render({
      licence: {
        crn: 'Y98765',
        licenceStartDate: '15/06/2024',
        dateOfBirth: '20/05/1985',
        forename: 'Jane',
        surname: 'Doe',
        isTimeServed: true,
      },
      prisonName,
      omuEmail: 'omu-mdi@example.com',
      backLink: '/licence/create/caseload',
      licenceType: 'AP',
    })

    expect($('h1').text()).toContain('Prison will create this licence')
    expect($('p.govuk-body').first().text()).toContain(
      `${prisonName} will create a licence for this person because they are being released immediately following sentencing having served time on remand.`,
    )
    expect($('#licence-review-warning').text()).toContain(
      'This licence must be reviewed after this person is released.',
    )
    expect($('.govuk-details__summary-text').text()).toContain('When no initial appointment is needed')
  })
})
