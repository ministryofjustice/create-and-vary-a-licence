import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import { ApprovalCase } from '../../../../@types/licenceApiClientTypes'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/approverSearch/approverSearch.njk').toString(),
)

const approvalNeededCases = [
  {
    licenceId: 1,
    name: 'Test Person 1',
    prisonerNumber: 'A1234AA',
    probationPractitioner: {
      name: 'Test Com 1',
      staffCode: 'ABC123',
    },
    submittedByFullName: 'Submitted Person',
    releaseDate: '01/05/2024',
    urgentApproval: false,
    approvedBy: null,
    approvedOn: null,
    kind: 'CRD',
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
  },
  {
    licenceId: 2,
    name: 'Test Person 2',
    prisonerNumber: 'A1234AB',
    probationPractitioner: {
      name: 'Test Com 2',
      staffCode: 'ABC456',
    },
    submittedByFullName: 'Submitted Person',
    releaseDate: '01/05/2024',
    urgentApproval: false,
    approvedBy: null,
    approvedOn: null,
    kind: 'CRD',
    prisonCode: 'WSI',
    prisonDescription: 'Wormwood Scrubs (HMP)',
  },
] as ApprovalCase[]

const recentlyApprovedCases = [
  {
    licenceId: 5,
    name: 'Test Person 5',
    prisonerNumber: 'A1234AE',
    releaseDate: '01/05/2024',
    probationPractitioner: {
      name: 'Test Com 1',
      staffCode: 'ABC123',
    },
    submittedByFullName: 'Submitted Person',
    urgentApproval: false,
    approvedBy: 'An Approver',
    approvedOn: '10/04/2023 00:00:00',
    kind: 'CRD',
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
  },
  {
    licenceId: 6,
    name: 'Test Person 6',
    prisonerNumber: 'A1234AF',
    probationPractitioner: {
      name: 'Test Com 2',
      staffCode: 'ABC456',
    },
    submittedByFullName: 'Submitted Person',
    releaseDate: '12/04/2024',
    urgentApproval: false,
    approvedBy: 'An Approver',
    approvedOn: '12/04/2023 00:00:00',
    kind: 'CRD',
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
  },
]

describe('View Prison Approver Search Results', () => {
  it('should display empty states correctly when no search results are found', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 0,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 0,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasSelectedMultiplePrisonCaseloads: false,
      approvalNeededCases: [],
      recentlyApprovedCases: [],
    })
    expect($('#approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Approval needed')
    expect($('.govuk-tabs__list a').text()).toContain('Recently approved')
    expect($('#tab-heading-approval-needed').text()).toContain('Approval needed (0 results)')
    expect($('#tab-heading-recently-approved').text()).toContain('Recently approved (0 results)')
    expect($('#approval-needed-empty-state-content').text()).toContain(
      `No licence approval requests that match 'Test'. Try searching again.`,
    )
    expect($('#recently-approved-empty-state-content').text()).toContain(
      `No recently approved licences that match 'Test'. Try searching again.`,
    )
  })

  it('should display the results in a table with links to the licence and COM details page for the approval needed tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 2,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 0,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasSelectedMultiplePrisonCaseloads: false,
      approvalNeededCases,
      recentlyApprovedCases: [],
    })
    expect($('#approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Approval needed (2 results)')
    expect($('#tab-heading-approval-needed').text()).toContain('Approval needed (2 results)')
    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > a').text()).toBe('Test Person 1')
    expect($('#name-1 > a').attr('href').trim()).toBe('/licence/approve/id/1/view')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#probation-practitioner-1').text()).toBe('Test Com 1')
    expect($('#probation-practitioner-1').attr('data-sort-value')).toBe('Test Com 1')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/approve/id/1/probation-practitioner',
    )

    expect($('thead').text()).not.toContain('Location')

    expect($('#submitted-by-1').text()).toBe('Submitted Person')
    expect($('#release-date-1').text()).toBe('1 May 2024')

    expect($('#name-2 > a').text()).toBe('Test Person 2')
    expect($('#name-2 > a').attr('href').trim()).toBe('/licence/approve/id/2/view')

    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#probation-practitioner-2').text()).toBe('Test Com 2')
    expect($('#probation-practitioner-2').attr('data-sort-value')).toBe('Test Com 2')
    expect($('#probation-practitioner-2 > .govuk-link').attr('href').trim()).toBe(
      '/licence/approve/id/2/probation-practitioner',
    )
    expect($('#submitted-by-2').text()).toBe('Submitted Person')
    expect($('#release-date-2').text()).toBe('1 May 2024')
  })

  it('should display the results in a table with links to the licence and COM details page for the recently approved tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 0,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 2,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasSelectedMultiplePrisonCaseloads: false,
      approvalNeededCases: [],
      recentlyApprovedCases,
    })
    expect($('#approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Recently approved (2 results)')
    expect($('#tab-heading-recently-approved').text()).toContain('Recently approved (2 results)')
    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > a').text()).toBe('Test Person 5')
    expect($('#name-1 > a').attr('href').trim()).toBe('/licence/view/id/5/pdf-print')
    expect($('#nomis-id-1').text()).toBe('A1234AE')
    expect($('#probation-practitioner-1').text()).toBe('Test Com 1')
    expect($('#probation-practitioner-1').attr('data-sort-value')).toBe('Test Com 1')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/approve/id/5/probation-practitioner',
    )
    expect($('thead').text()).not.toContain('Location')

    expect($('#release-date-1').text()).toBe('1 May 2024')
    expect($('#approved-by-1').text()).toBe('An Approver')
    expect($('#approved-on-1').text()).toBe('10 Apr 2023')

    expect($('#name-2 > a').text()).toBe('Test Person 6')
    expect($('#nomis-id-2').text()).toBe('A1234AF')
    expect($('#probation-practitioner-2').text()).toBe('Test Com 2')
    expect($('#probation-practitioner-2').attr('data-sort-value')).toBe('Test Com 2')
    expect($('#probation-practitioner-2 > .govuk-link').attr('href').trim()).toBe(
      '/licence/approve/id/6/probation-practitioner',
    )
    expect($('#release-date-2').text()).toBe('12 Apr 2024')
    expect($('#approved-by-1').text()).toBe('An Approver')
    expect($('#approved-on-1').text()).toBe('10 Apr 2023')
  })

  it('should display urgent approval required warning label when needed', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 1,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 0,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasSelectedMultiplePrisonCaseloads: false,
      approvalNeededCases: [
        {
          licenceId: 1,
          name: 'Test Person 1',
          prisonerNumber: 'A1234AA',
          probationPractitioner: {
            name: 'Test Com 1',
            staffCode: 'ABC123',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      recentlyApprovedCases: [],
    })
    expect($('#approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Approval needed (1 result)')
    expect($('#tab-heading-approval-needed').text()).toContain('Approval needed (1 result)')
    expect($('tbody .govuk-table__row').length).toBe(1)

    expect($('#name-1 > a').text()).toBe('Test Person 1')
    expect($('#name-1 > a').attr('href').trim()).toBe('/licence/approve/id/1/view')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#probation-practitioner-1').text()).toBe('Test Com 1')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/approve/id/1/probation-practitioner',
    )

    expect($('#submitted-by-1').text()).toBe('Submitted Person')
    expect($('#release-date-1').text()).toBe('1 May 2024Urgent approval required forupcoming release')
  })

  it('should display HDC release warning label when kind is HDC and approval is needed', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 1,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 0,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasSelectedMultiplePrisonCaseloads: false,
      approvalNeededCases: [
        {
          licenceId: 1,
          name: 'Test Person 1',
          prisonerNumber: 'A1234AA',
          probationPractitioner: {
            name: 'Test Com 1',
            staffCode: 'ABC123',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: false,
          approvedBy: null,
          approvedOn: null,
          kind: 'HDC',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      recentlyApprovedCases: [],
    })
    expect($('#approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Approval needed (1 result)')
    expect($('#tab-heading-approval-needed').text()).toContain('Approval needed (1 result)')
    expect($('tbody .govuk-table__row').length).toBe(1)

    expect($('#name-1 > a').text()).toBe('Test Person 1')
    expect($('#name-1 > a').attr('href').trim()).toBe('/licence/approve/id/1/view')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#probation-practitioner-1').text()).toBe('Test Com 1')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/approve/id/1/probation-practitioner',
    )

    expect($('#submitted-by-1').text()).toBe('Submitted Person')
    expect($('#release-date-1').text()).toBe('1 May 2024HDC release')
  })

  it('should display the location column with data when the user has selected multiple prison caseloads', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 2,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 0,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasSelectedMultiplePrisonCaseloads: true,
      approvalNeededCases,
      recentlyApprovedCases: [],
    })
    expect($('thead').text()).toContain('Location')
    expect($('#location-1').text()).toBe('Moorland (HMP)')
    expect($('#location-2').text()).toBe('Wormwood Scrubs (HMP)')
  })
})
