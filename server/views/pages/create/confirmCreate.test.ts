import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/confirmCreate.njk').toString())

describe('View are you sure you to create this licence page', () => {
  it('should display recall status for a standard recall licence', () => {
    const $ = render({
      licence: {
        crn: 'X12345',
        licenceStartDate: '01/05/2024',
        dateOfBirth: '12/02/1980',
        forename: 'Forename',
        surname: 'Surname',
        isEligibleForEarlyRelease: false,
        kind: 'PRRD',
        recallType: 'STANDARD',
      },
      backLink: '/licence/create/caseload',
    })

    expect($('h1').text()).toContain("Are you sure you want to create this person's licence?")
    expect($('.offender-name').text()).toContain('Forename Surname')
    expect($('.offender-crn').text()).toContain('X12345')
    expect($('[data-qa="recall-type"]').text()).toContain('Standard recall')
    expect($('[data-qa="continue"]').text()).toContain('Continue and create licence')
    expect($('[data-qa="return-to-caselist"]').text()).toContain('Return to case list')
  })

  it('should display recall status for a fixed term recall licence', () => {
    const $ = render({
      licence: {
        crn: 'X12345',
        licenceStartDate: '01/05/2024',
        dateOfBirth: '12/02/1980',
        forename: 'Forename',
        surname: 'Surname',
        isEligibleForEarlyRelease: false,
        kind: 'PRRD',
        recallType: 'FIXED_TERM',
      },
      backLink: '/licence/create/caseload',
    })

    expect($('h1').text()).toContain("Are you sure you want to create this person's licence?")
    expect($('.offender-name').text()).toContain('Forename Surname')
    expect($('.offender-crn').text()).toContain('X12345')
    expect($('[data-qa="recall-type"]').text()).toContain('Fixed-term recall')
    expect($('[data-qa="continue"]').text()).toContain('Continue and create licence')
    expect($('[data-qa="return-to-caselist"]').text()).toContain('Return to case list')
  })
})
