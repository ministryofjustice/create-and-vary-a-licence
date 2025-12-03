import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import LicenceType from '../../../enumeration/licenceType'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary-approve/cases.njk').toString())

const pduCases = [
  {
    licenceId: 1,
    name: 'Test Person One',
    crnNumber: 'X12345',
    licenceType: LicenceType.AP,
    releaseDate: '01/05/2024',
    variationRequestDate: '03/06/2024',
    probationPractitioner: 'Com One',
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
    probationPractitioner: 'Com One',
  },
  {
    licenceId: 2,
    name: 'Test Person Two',
    crnNumber: 'X12346',
    licenceType: LicenceType.AP,
    releaseDate: '02/11/2022',
    variationRequestDate: '01/08/2024',
    probationPractitioner: 'Com Four',
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

  it('should display probation practitioner as Unallocated', () => {
    const unallocatedComCase = [
      {
        licenceId: 3,
        name: 'Test Person Three',
        crnNumber: 'X12347',
        licenceType: LicenceType.AP,
        releaseDate: '15/09/2023',
        variationRequestDate: '20/06/2024',
        probationPractitioner: '',
      },
    ]
    const $ = render({
      caseload: unallocatedComCase,
      search: '',
      regionCases: false,
    })

    expect($('#probation-practitioner-1').text()).toBe('Not allocated yet')
    expect($('#probation-practitioner-1 > .govuk-link').length).toBe(0)
  })
})
