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
})
