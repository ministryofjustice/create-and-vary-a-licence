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

  it('should display warning if prisoner in hard stop is being re-released after a recall', () => {
    const $ = render({
      licence: {
        licenceId: 3,
        name: 'Biydaav Griya',
        crnNumber: 'Z882661',
        typeCode: 'PSS',
        releaseDate: '13 Feb 2023',
        licenceStatus: 'ACTIVE',
        probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        postRecallReleaseDate: '2024-12-12',
        eligibleKind: 'PRRD',
      },
    })
    const element = $('[data-qa=prrd-warning]')
    expect(element.length).toBe(1)
    expect(element.text()).toContain('Warning')
    expect(element.text()).toContain('This person was released following a fixed-term recall.')
    expect(element.text()).toContain('Check their previous licence conditions. You should do this using EPF 2.')
  })
  it('should display appropriate time served hint message and labels', () => {
    const $ = render({
      licence: {
        licenceId: 3,
        name: 'Biydaav Griya',
        crnNumber: 'Z882661',
        typeCode: 'PSS',
        releaseDate: '13 Feb 2023',
        licenceStatus: 'ACTIVE',
        probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        postRecallReleaseDate: '2024-12-12',
        eligibleKind: 'TIME_SERVED',
        kind: 'TIME_SERVED',
      },
    })

    const label = $(`label[for="radio-option"]`)
    expect(label.text()).toContain('Yes - vary this licence now')

    const label2 = $(`label[for="radio-option-2"]`)
    expect(label2.text()).toContain('No - leave unchanged and return to licence history')

    const message = $('[data-qa="additional-message"]')
    expect(message.length).toBe(0)
  })
})
