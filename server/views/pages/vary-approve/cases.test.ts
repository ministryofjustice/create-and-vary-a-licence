import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import LicenceType from '../../../enumeration/licenceType'
import { VaryApproverCase } from '../../../@types/licenceApiClientTypes'
import config from '../../../config'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary-approve/cases.njk').toString())

const pduCases = [
  {
    licenceId: 1,
    name: 'Test Person One',
    crnNumber: 'X12345',
    licenceType: LicenceType.AP,
    releaseDate: '01/05/2024',
    variationRequestDate: '03/06/2024',
    probationPractitioner: {
      staffCode: 'X1231',
      name: 'Com One',
      allocated: true,
    },
    isRestricted: false,
  },
]

const laoCases: VaryApproverCase[] = [
  {
    licenceId: 1,
    name: 'Access restricted on NDelius',
    crnNumber: 'X99999',
    licenceType: null,
    releaseDate: null,
    variationRequestDate: null,
    probationPractitioner: {
      staffCode: 'Restricted',
      name: 'Restricted',
      allocated: true,
    },
    isRestricted: true,
  },
]

const pduCasesWithLao: VaryApproverCase[] = [
  {
    licenceId: 1,
    name: 'Test Person One',
    crnNumber: 'X12345',
    licenceType: LicenceType.AP,
    releaseDate: '01/05/2024',
    variationRequestDate: '03/06/2024',
    probationPractitioner: {
      staffCode: 'X1231',
      name: 'Com One',
      allocated: true,
    },
    isRestricted: false,
  },
  {
    licenceId: null,
    name: 'Access restricted on NDelius',
    crnNumber: 'A123456',
    licenceType: null,
    releaseDate: null,
    variationRequestDate: null,
    probationPractitioner: {
      staffCode: 'Restricted',
      name: 'Restricted',
      allocated: true,
    },
    isRestricted: true,
  },
]

const allRegionCases = [
  {
    licenceId: 1,
    name: 'Test Person One',
    crnNumber: 'X12345',
    licenceType: LicenceType.AP,
    releaseDate: '01/05/2024',
    variationRequestDate: '03/06/2024',
    probationPractitioner: {
      staffCode: 'X1231',
      name: 'Com One',
      allocated: true,
    },
    isRestricted: false,
  },
  {
    licenceId: 2,
    name: 'Test Person Two',
    crnNumber: 'X12346',
    licenceType: LicenceType.AP,
    releaseDate: '02/11/2022',
    variationRequestDate: '01/08/2024',
    probationPractitioner: {
      staffCode: 'X1234',
      name: 'Com Four',
      allocated: true,
    },
    isRestricted: false,
  },
]

describe('View Vary Approver case list', () => {
  it('should display empty state correctly', () => {
    const $ = render({
      caseload: [],
      regionCases: false,
    })
    expect($('.govuk-heading-xl').text()).toBe('Select a person to approve their licence variation')
    expect($('#myCases').text()).toContain('Cases in this PDU')
    expect($('#allRegions').text()).toContain('All cases in this region')
    expect($('#vary-approval-empty-state-content').text()).toContain(`No licence variations to approve.`)
  })

  it('should display pdu cases in a table with links to the licence and COM details page', () => {
    const $ = render({
      caseload: pduCases,
      regionCases: false,
    })
    expect($('.govuk-heading-xl').text()).toBe('Select a person to approve their licence variation')
    expect($('#myCases').text()).toContain('Cases in this PDU')
    expect($('#allRegions').text()).toContain('All cases in this region')
    expect($('tbody .govuk-table__row').length).toBe(1)

    expect($('#name-link-1').text()).toBe('Test Person One')
    expect($('#name-link-1').attr('href').trim()).toBe('/licence/vary-approve/id/1/view')
    expect($('#licence-type-1').text()).toContain('Standard determinate')
    expect($('#probation-practitioner-1').text()).toBe('Com One')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/vary-approve/id/1/probation-practitioner',
    )

    expect($('#variation-request-date-1').text()).toBe('3 Jun 2024')
    expect($('#release-date-1').text()).toBe('1 May 2024')
  })

  it('should display all region cases in a table with links to the licence and COM details page', () => {
    const $ = render({
      caseload: allRegionCases,
      regionCases: true,
    })
    expect($('.govuk-heading-xl').text()).toBe('Select a person to approve their licence variation')
    expect($('#myCases').text()).toContain('Cases in this PDU')
    expect($('#allRegions').text()).toContain('All cases in this region')
    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-link-1').text()).toBe('Test Person One')
    expect($('#name-link-1').attr('href').trim()).toBe('/licence/vary-approve/id/1/view')
    expect($('#licence-type-1').text()).toContain('Standard determinate')
    expect($('#probation-practitioner-1').text()).toBe('Com One')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/vary-approve/id/1/probation-practitioner',
    )

    expect($('#variation-request-date-1').text()).toBe('3 Jun 2024')
    expect($('#release-date-1').text()).toBe('1 May 2024')

    expect($('#name-link-2').text()).toBe('Test Person Two')
    expect($('#name-link-2').attr('href').trim()).toBe('/licence/vary-approve/id/2/view')

    expect($('#licence-type-2').text()).toContain('Standard determinate')
    expect($('#probation-practitioner-2').text()).toBe('Com Four')
    expect($('#probation-practitioner-2 > .govuk-link').attr('href').trim()).toBe(
      '/licence/vary-approve/id/2/probation-practitioner',
    )
    expect($('#variation-request-date-2').text()).toBe('1 Aug 2024')
    expect($('#release-date-2').text()).toBe('2 Nov 2022')
  })

  it('should display probation practitioner as Not allocated', () => {
    const unallocatedComCase = [
      {
        licenceId: 3,
        name: 'Test Person Three',
        crnNumber: 'X12347',
        licenceType: LicenceType.AP,
        releaseDate: '15/09/2023',
        variationRequestDate: '20/06/2024',
        probationPractitioner: {
          name: 'Not allocated',
          staffCode: null,
          allocated: false,
        },
      },
    ] as VaryApproverCase[]
    const $ = render({
      caseload: unallocatedComCase,
      search: '',
      regionCases: false,
    })

    expect($('#probation-practitioner-1').text()).toBe('Not allocated')
    expect($('#probation-practitioner-1 > .govuk-link').length).toBe(0)
  })

  it('should display LAO case name as link to restricted details page', () => {
    config.laoEnabled = true
    const $ = render({
      caseload: laoCases,
      regionCases: false,
    })

    expect($('#name-1').text()).toContain('Access restricted on NDelius')
    expect($('#name-1 .caseload-offender-name').text()).toContain('Access restricted on NDelius')
    expect($('#name-link-1').length).toBe(1)
    expect($('#name-1 a').length).toBe(1)
    expect($('#name-link-1').attr('href').trim()).toBe('/X99999/restricted')
  })

  it('should redact LAO case data', () => {
    config.laoEnabled = true
    const $ = render({
      caseload: laoCases,
      regionCases: false,
    })

    expect($('#licence-type-1').text()).toContain('Restricted')
    expect($('#probation-practitioner-1').text()).toContain('Restricted')
    expect($('#variation-request-date-1').text()).toContain('Restricted')
    expect($('#release-date-1').text()).toContain('Restricted')
  })

  it('should handle mixed LAO and non-LAO cases correctly', () => {
    config.laoEnabled = true
    const $ = render({
      caseload: pduCasesWithLao,
      regionCases: false,
    })

    expect($('#name-link-1').text()).toBe('Test Person One')
    expect($('#name-link-1').attr('href').trim()).toBe('/licence/vary-approve/id/1/view')
    expect($('#licence-type-1').text()).toContain('Standard determinate')
    expect($('#probation-practitioner-1').text()).toBe('Com One')

    expect($('#name-2').text()).toContain('Access restricted on NDelius')
    expect($('#name-link-2').length).toBe(1)
    expect($('#name-link-2').attr('href').trim()).toBe('/A123456/restricted')
    expect($('#licence-type-2').text()).toContain('Restricted')
    expect($('#probation-practitioner-2').text()).toContain('Restricted')
  })
})
