import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

import config from '../../../config'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/caseload.njk').toString())

describe('Caseload', () => {
  it('should display Active badge', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM', allocated: true },
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
    expect($('.urgent-highlight-message').text().toString()).toEqual('')
    expect($('#probation-practitioner-1').text().toString()).toBe('CVL COM')
  })

  it('should display badge', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'VARIATION_IN_PROGRESS',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM', allocated: true },
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
    expect($('.urgent-highlight-message').text().toString()).toEqual('')
    expect($('#probation-practitioner-1').text().toString()).toBe('CVL COM')
  })

  it('should display Review needed badge', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM', allocated: true },
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
    expect($('.urgent-highlight-message').text().toString()).toEqual('Timed out')
    expect($('#probation-practitioner-1').text().toString()).toBe('CVL COM')
  })

  it('should highlight a HDC licence with a HDC release warning label', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM', allocated: true },
          kind: 'HDC',
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
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('.status-badge').text().toString()).toContain('Active')
    expect($('#release-date-1').text()).toBe('13 Feb 2023HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
    expect($('#probation-practitioner-1').text().toString()).toBe('CVL COM')
  })

  it('should highlight a HDC variation with a HDC release warning label', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM', allocated: true },
          kind: 'HDC_VARIATION',
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
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('.status-badge').text().toString()).toContain('Active')
    expect($('#release-date-1').text()).toBe('13 Feb 2023HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
    expect($('#probation-practitioner-1').text().toString()).toBe('CVL COM')
  })

  it('should highlight Not allocated label if licence has no probation practitioner and highlight a Time-served release warning label when licence is time-served', () => {
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          },
          kind: 'TIME_SERVED',
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
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('.status-badge').text().toString()).toContain('Review needed')
    expect($('#release-date-1').text()).toBe('13 Feb 2023Time-served release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('Time-served release')
    expect($('#probation-practitioner-1').text().toString()).toBe('Not allocated')
  })

  it('should render name as plain text for LAO users', () => {
    config.laoEnabled = true
    const $ = render({
      caseload: [
        {
          licenceId: null,
          name: 'Access restricted on NDelius',
          crnNumber: 'A111111',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: null,
          probationPractitioner: { staffCode: 'Restricted', name: 'Restricted', allocated: true },
          isLao: true,
        },
      ],
      statusConfig: { ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' } },
    })
    expect($('#name-link-1').length).toBe(0)
    expect($('#name-1').text()).toContain('Access restricted on NDelius')
    expect($('.govuk-hint').text()).toContain('CRN: A111111')
  })

  it('should render name as link for non-LAO users when LAO is enabled', () => {
    config.laoEnabled = true
    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM', allocated: true },
          isLao: false,
        },
      ],
      statusConfig: { ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' } },
    })
    expect($('#name-link-1').attr('href')).toBe('/licence/vary/id/3/timeline')
    expect($('#name-link-1').text()).toContain('Test Person')
    expect($('.govuk-hint').text()).toContain('CRN: Z882661')
  })

  it('should apply redactIfLao filter to licence type for LAO cases', () => {
    config.laoEnabled = true

    const $ = render({
      caseload: [
        {
          licenceId: null,
          name: 'Access restricted on NDelius',
          crnNumber: 'A111111',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: null,
          probationPractitioner: { staffCode: 'Restricted', name: 'Restricted', allocated: true },
          isLao: true,
        },
      ],
      statusConfig: { ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' } },
    })
    expect($('#licence-type-1').text().trim()).toBe('Restricted')
  })

  it('should apply redactIfLao filter to probation practitioner for LAO cases', () => {
    config.laoEnabled = true
    const $ = render({
      caseload: [
        {
          licenceId: null,
          name: 'Access restricted on NDelius',
          crnNumber: 'A111111',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: null,
          probationPractitioner: { staffCode: 'Restricted', name: 'Restricted', allocated: true },
          isLao: true,
        },
      ],
      statusConfig: { ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' } },
    })
    expect($('#probation-practitioner-1').text().trim()).toBe('Restricted')
  })

  it('should apply redactIfLao filter to release date for LAO cases', () => {
    config.laoEnabled = true

    const $ = render({
      caseload: [
        {
          licenceId: null,
          name: 'Access restricted on NDelius',
          crnNumber: 'A111111',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: null,
          probationPractitioner: { staffCode: 'Restricted', name: 'Restricted', allocated: true },
          isLao: true,
        },
      ],
      statusConfig: { ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' } },
    })
    expect($('#release-date-1').text().trim()).toBe('Restricted')
  })

  it('should apply redactIfLao filter to licence status for LAO cases', () => {
    config.laoEnabled = true

    const $ = render({
      caseload: [
        {
          licenceId: null,
          name: 'Access restricted on NDelius',
          crnNumber: 'A111111',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: null,
          probationPractitioner: { staffCode: 'Restricted', name: 'Restricted', allocated: true },
          isLao: true,
        },
      ],
      statusConfig: { ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' } },
    })
    expect($('#licence-status-1').text().trim()).toBe('Restricted')
  })

  it('should not redact information for non-LAO cases', () => {
    config.laoEnabled = true

    const $ = render({
      caseload: [
        {
          licenceId: 3,
          name: 'Test Person',
          crnNumber: 'Z882661',
          licenceType: 'AP',
          releaseDate: '13 Feb 2023',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM', allocated: true },
          isLao: false,
        },
      ],
      statusConfig: { ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' } },
    })
    expect($('#licence-type-1').text().trim()).not.toBe('Restricted')
    expect($('#probation-practitioner-1').text().trim()).not.toBe('Restricted')
    expect($('#release-date-1').text().trim()).not.toBe('Restricted')
    expect($('#licence-status-1').text().trim()).not.toBe('Restricted')
  })

  it('should display multiple cases with mixed LAO and non-LAO offenders', () => {
    config.laoEnabled = true
    const $ = render({
      caseload: [
        {
          licenceId: null,
          name: 'Access restricted on NDelius',
          crnNumber: 'A111111',
          licenceType: 'AP',
          releaseDate: '10 Jan 2023',
          licenceStatus: null,
          probationPractitioner: { staffCode: 'Restricted', name: 'Restricted', allocated: true },
          isLao: true,
        },
        {
          licenceId: 2,
          name: 'Test Person',
          crnNumber: 'B222222',
          licenceType: 'PSS',
          releaseDate: '15 Feb 2023',
          licenceStatus: 'VARIATION_IN_PROGRESS',
          probationPractitioner: { staffCode: 'X22222', name: 'Officer Two', allocated: true },
          isLao: false,
        },
      ],
      statusConfig: {
        ACTIVE: { label: 'Active', description: 'Active', colour: 'turquoise' },
        VARIATION_IN_PROGRESS: { label: 'Variation in progress', description: 'In progress', colour: 'blue' },
      },
    })
    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#licence-type-1').text().trim()).toBe('Restricted')
    expect($('#name-link-1').length).toBe(0)
    expect($('#name-1').text()).toContain('Access restricted on NDelius')

    expect($('#licence-type-2').text().trim()).not.toBe('Restricted')
    expect($('#name-link-2').attr('href')).toBe('/licence/vary/id/2/timeline')
  })
})
