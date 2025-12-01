import fs from 'fs'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import LicenceType from '../../../enumeration/licenceType'

describe('View print licence button', () => {
  const render = templateRenderer(fs.readFileSync('server/views/pages/create/licenceCreatedByPrison.njk').toString())

  it('should show print licence pdf button', () => {
    const $ = render({
      licence: {
        statusCode: LicenceStatus.APPROVED,
        prisonDescription: 'prisonDescription',
        typeCode: LicenceType.AP_PSS,
      },
      omuEmail: 'jbloggs@justice.gov.uk',
      backLink: '/licence/create/caseload',
    })

    expect($('[data-qa="print-licence"]').length).toBeTruthy()
  })

  it('should hide print licence pdf button', () => {
    const $ = render({
      licence: {
        statusCode: LicenceStatus.SUBMITTED,
      },
      omuEmail: 'jbloggs@justice.gov.uk',
      backLink: '/licence/create/caseload',
    })
    expect($('[data-qa="print-licence"]').length).toBeFalsy()
  })

  it('should show licence details for HARD_STOP', () => {
    const $ = render({
      licence: {
        statusCode: LicenceStatus.APPROVED,
        prisonDescription: 'prisonDescription',
        typeCode: LicenceType.AP,
        hardStopKind: 'HARD_STOP',
      },
      omuEmail: 'jbloggs@justice.gov.uk',
      backLink: '/licence/create/caseload',
    })
    expect($('p.govuk-body').first().text()).toContain(
      'A licence for this person has been created by the prison because none was submitted in time for their final release checks.',
    )
  })
  it('should show licence details for TIME_SERVED', () => {
    const $ = render({
      licence: {
        statusCode: LicenceStatus.APPROVED,
        prisonDescription: 'prisonDescription',
        typeCode: LicenceType.PSS,
        hardStopKind: 'TIME_SERVED',
      },
      omuEmail: 'jbloggs@justice.gov.uk',
      backLink: '/licence/create/caseload',
    })
    expect($('p.govuk-body').first().text()).toContain(
      'A licence for this person has been created by the prison because they are being released immediately following sentencing having served time on remand.',
    )
  })
})
