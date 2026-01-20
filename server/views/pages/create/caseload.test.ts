import fs from 'fs'

import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import LicenceKind from '../../../enumeration/LicenceKind'

interface ProbationPractitioner {
  name: string
  staffCode: string
  allocated: boolean
}

const render = templateRenderer(fs.readFileSync('server/views/pages/create/caseload.njk').toString())

describe('Create a Licence Views - Caseload', () => {
  it('should display a table containing the caseload', () => {
    const $ = render({
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > .caseload-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#name-2 > .caseload-offender-name > a').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
  })

  it('should display probation practitioner in the table or unallocated', () => {
    const $ = render({
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'X12345',
            allocated: true,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          } as ProbationPractitioner,
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          kind: LicenceKind.TIME_SERVED,
          name: 'Zohn Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          } as ProbationPractitioner,
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(3)
    expect($('#name-1 > .caseload-offender-name > a').text()).toBe('Test Person')
    expect($('#probation-practitioner-1').text()).toBe('Joe Bloggs')
    expect($('#probation-practitioner-1 > a').attr('href')).toBe(
      '/licence/create/probation-practitioner/staffCode/X12345',
    )

    expect($('#name-2 > .caseload-offender-name > a').text()).toBe('John Smith')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#probation-practitioner-2').text()).toBe('Not allocated')

    expect($('#name-3 > .caseload-offender-name > a').text()).toBe('Zohn Smith')
    expect($('#release-date-3').text()).toBe('01 September 2022Time-served release')
    expect($('#probation-practitioner-3').text()).toBe('Not allocated')
  })

  it('should display the caseload with a case outside the pilot area', () => {
    const $ = render({
      statusConfig,
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: false,
          licenceStatus: LicenceStatus.NOT_IN_PILOT,
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .caseload-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Outside pilot')
  })

  it('should display the caseload with a case as a recall', () => {
    const $ = render({
      statusConfig,
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: false,
          licenceStatus: LicenceStatus.OOS_RECALL,
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .caseload-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Recall')
  })

  it('should display the caseload with a case as a breach of supervision', () => {
    const $ = render({
      statusConfig,
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: false,
          licenceStatus: LicenceStatus.OOS_BOTUS,
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .caseload-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Breach of supervision')
  })

  it('should display the caseload with links to the licence or confirm create page', () => {
    const $ = render({
      statusConfig,
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'X381306',
          prisonerNumber: 'ABC123',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
          createLink: '/licence/create/nomisId/ABC123/confirm',
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          prisonerNumber: 'ABC125',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: true,
          licenceId: 1,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          createLink: '/licence/create/id/1/check-your-answers',
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .caseload-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')
    expect($('#name-1 > .caseload-offender-name > a').attr('href').trim()).toBe(
      '/licence/create/nomisId/ABC123/confirm',
    )

    expect($('#name-2 > .caseload-offender-name > a').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('In progress')
    expect($('#name-2 > .caseload-offender-name > a').attr('href').trim()).toBe(
      '/licence/create/id/1/check-your-answers',
    )
  })

  it('should highlight a HDC licence with a HDC release warning label', () => {
    const $ = render({
      statusConfig,
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'A123456',
          prisonerNumber: 'ABC123',
          releaseDate: '20 December 2025',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          createLink: '/licence/create/nomisId/ABC123/confirm',
          kind: LicenceKind.HDC,
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
    expect($('#release-date-1').text()).toBe('20 December 2025HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
  })

  it('should highlight a HDC variation with a HDC release warning label', () => {
    const $ = render({
      statusConfig,
      caseload: [
        {
          name: 'Test Person',
          crnNumber: 'A123456',
          prisonerNumber: 'ABC123',
          releaseDate: '20 December 2025',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'ABC123',
            allocated: true,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          createLink: '/licence/create/nomisId/ABC123/confirm',
          kind: LicenceKind.HDC_VARIATION,
        },
      ],
    })

    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
    expect($('#release-date-1').text()).toBe('20 December 2025HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
  })

  it('should highlight a TIME_SERVED case with a Time-served release warning label', () => {
    // Given
    const caseloadData = [
      {
        name: 'Test Person',
        crnNumber: 'A123456',
        prisonerNumber: 'ABC123',
        releaseDate: '20 December 2025',
        probationPractitioner: {
          name: 'Not allocated',
          staffCode: null,
          allocated: false,
        } as ProbationPractitioner,
        isClickable: true,
        licenceStatus: LicenceStatus.TIMED_OUT,
        createLink: '/licence/create/nomisId/ABC123/confirm',
        kind: LicenceKind.TIME_SERVED,
      },
    ]

    // When
    const $ = render({
      statusConfig,
      caseload: caseloadData,
    })

    // Then
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#release-date-1').text()).toBe('20 December 2025Time-served release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('Time-served release')
    expect($('#probation-practitioner-1').text()).toBe('Not allocated')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Timed out')
  })
})
