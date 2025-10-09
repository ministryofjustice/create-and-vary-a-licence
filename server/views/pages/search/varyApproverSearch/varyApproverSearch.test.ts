import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import LicenceType from '../../../../enumeration/licenceType'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/varyApproverSearch/varyApproverSearch.njk').toString(),
)

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

const regionCases = [
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

describe('View Vary Approver Search Results', () => {
  it('should display empty states correctly when no search results are found', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/vary-approve/list',
      tabParameters: {
        activeTab: '#pdu-cases',
        pduCases: {
          tabId: 'tab-heading-pdu-cases',
          tabHeading: 'Cases in this PDU',
          resultsCount: 0,
        },
        regionCases: {
          tabId: 'tab-heading-region-cases',
          tabHeading: 'All cases in this region',
          resultsCount: 0,
        },
      },
      pduCases: [],
      regionCases: [],
    })
    expect($('#vary-approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Cases in this PDU')
    expect($('.govuk-tabs__list a').text()).toContain('All cases in this region')
    expect($('#tab-heading-pdu-cases').text()).toContain('Cases in this PDU (0 results)')
    expect($('#tab-heading-region-cases').text()).toContain('All cases in this region (0 results)')
    expect($('#vary-approval-search-empty-state-content').text()).toContain(
      `No licence variation requests that match 'Test'. Try searching again`,
    )
  })

  it('should display the results in a table with links to the licence and COM details page for the pdu cases tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/vary-approve/list',
      tabParameters: {
        activeTab: '#region-cases',
        pduCases: {
          tabId: 'tab-heading-pdu-cases',
          tabHeading: 'Cases in this PDU',
          resultsCount: 2,
        },
        regionCases: {
          tabId: 'tab-heading-region-cases',
          tabHeading: 'All cases in this region',
          resultsCount: 0,
        },
      },
      pduCases,
      regionCases: [],
    })
    expect($('#vary-approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Cases in this PDU (2 results)')
    expect($('.govuk-tabs__list a').text()).toContain('All cases in this region (0 results)')
    expect($('#tab-heading-pdu-cases').text()).toContain('Cases in this PDU (2 results)')
    expect($('#tab-heading-region-cases').text()).toContain('All cases in this region (0 results)')
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

  it('should display the results in a table with links to the licence and COM details page for the region cases tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/vary-approve/list',
      tabParameters: {
        activeTab: '#region-cases',
        pduCases: {
          tabId: 'tab-heading-pdu-cases',
          tabHeading: 'Cases in this PDU',
          resultsCount: 0,
        },
        regionCases: {
          tabId: 'tab-heading-region-cases',
          tabHeading: 'All cases in this region',
          resultsCount: 1,
        },
      },
      pduCases: [],
      regionCases,
    })
    expect($('#vary-approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Cases in this PDU (0 results)')
    expect($('.govuk-tabs__list a').text()).toContain('All cases in this region (1 result)')
    expect($('#tab-heading-pdu-cases').text()).toContain('Cases in this PDU (0 results)')
    expect($('#tab-heading-region-cases').text()).toContain('All cases in this region (1 result)')
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
})
