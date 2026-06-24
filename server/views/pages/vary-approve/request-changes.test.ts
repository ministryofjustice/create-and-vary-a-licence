import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary-approve/request-changes.njk').toString())

describe('Request changes', () => {
  it('should display variation details', () => {
    const $ = render({
      licence: {
        licenceId: 3,
        name: 'First Last',
        crnNumber: 'Z882661',
        releaseDate: '13 Feb 2023',
        licenceStatus: 'ACTIVE',
        probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        spoDiscussion: 'Yes',
        vloDiscussion: 'No',
      },
      conversation: [
        {
          who: 'A com',
          when: '14/02/2029 12:32',
          comment: 'something needed changing',
          role: 'COM',
        },
      ],
    })

    expect($('.govuk-summary-list__row').length).toBe(3)

    expect($('.govuk-summary-list__row:nth-of-type(1) .govuk-summary-list__key').text()).toContain(
      'Have you discussed this variation request with your SPO?',
    )
    expect($('.govuk-summary-list__row:nth-of-type(1) .govuk-summary-list__value').text()).toContain('Yes')

    expect($('.govuk-summary-list__row:nth-of-type(2) .govuk-summary-list__key').text()).toContain(
      'Have you consulted with the victim liaison officer (VLO) for this case?',
    )
    expect($('.govuk-summary-list__row:nth-of-type(2) .govuk-summary-list__value').text()).toContain('No')

    expect($('.govuk-summary-list__row:nth-of-type(3) .govuk-summary-list__key').text()).toContain(
      'Reasons for the variation',
    )
    expect($('.govuk-summary-list__row:nth-of-type(3) .govuk-summary-list__value').text()).toContain(
      'something needed changing',
    )
    expect($('.govuk-summary-list__row:nth-of-type(3) .govuk-summary-list__value').text()).toContain(
      'By A Com, 14 February 2029',
    )
  })
})
