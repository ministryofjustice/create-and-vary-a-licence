import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/reviewLicence.njk').toString())

describe('Caseload', () => {
  it('should display standard conditions text', () => {
    const $ = render({
      licence: {
        licenceId: 3,
        name: 'Biydaav Griya',
        crnNumber: 'Z882661',
        typeCode: 'AP',
        releaseDate: '13 Feb 2023',
        licenceStatus: 'ACTIVE',
        probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
      },
    })
    expect($('.licence-conditions').text().toString()).toContain('standard conditions')
  })

  it('should display post sentence supervision text', () => {
    const $ = render({
      licence: {
        licenceId: 3,
        name: 'Biydaav Griya',
        crnNumber: 'Z882661',
        typeCode: 'PSS',
        releaseDate: '13 Feb 2023',
        licenceStatus: 'ACTIVE',
        probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
      },
    })
    expect($('.licence-conditions').text().toString()).toContain(
      'This licence contains standard post sentence supervision requirements only by default.',
    )
  })
})
