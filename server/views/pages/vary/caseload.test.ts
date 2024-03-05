import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/caseload.njk').toString())

describe('Caseload', () => {
  it('should display Active badge', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Biydaav Griya',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
      ],
      statusConfig: {
        ACTIVE: {
          label: 'Active',
          description: 'Approved by the prison and is now the currently active licence',
          colour: 'turquoise',
        },
        VARIATION_IN_PROGRESS: {
          label: 'Variation in progress',
          description: 'Variation in progress',
          colour: 'blue',
        },
      },
    })
    expect($('.status-badge').text().toString()).toContain('Active')
    expect($('.approval-overdue-message').text().toString()).toEqual('')
  })

  it('should display badge', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Biydaav Griya',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'VARIATION_IN_PROGRESS',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
      ],
      statusConfig: {
        ACTIVE: {
          label: 'Active',
          description: 'Approved by the prison and is now the currently active licence',
          colour: 'turquoise',
        },
        VARIATION_IN_PROGRESS: {
          label: 'Variation in progress',
          description: 'Variation in progress',
          colour: 'blue',
        },
      },
    })
    expect($('.status-badge').text().toString()).toContain('Variation in progress')
    expect($('.approval-overdue-message').text().toString()).toEqual('')
  })

  it('should display Review needed badge', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Biydaav Griya',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
      ],
      statusConfig: {
        ACTIVE: {
          label: 'Active',
          description: 'Approved by the prison and is now the currently active licence',
          colour: 'turquoise',
        },
        VARIATION_IN_PROGRESS: {
          label: 'Variation in progress',
          description: 'Variation in progress',
          colour: 'blue',
        },
        REVIEW_NEEDED: {
          label: 'Review needed',
          description: 'Review needed',
          colour: 'red',
        },
      },
    })
    expect($('.status-badge').text().toString()).toContain('Review needed')
    expect($('.approval-overdue-message').text().toString()).toEqual('Timed out')
  })
})
