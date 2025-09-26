import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import { CaViewCasesTab, LicenceKind, LicenceStatus } from '../../../../enumeration'
import statusConfig from '../../../../licences/licenceStatus'

const render = templateRenderer(fs.readFileSync('server/views/pages/search/caSearch/caSearch.njk').toString())

const inPrisonResults = [
  {
    kind: LicenceKind.CRD,
    licenceId: 1,
    name: 'Test Person 1',
    prisonerNumber: 'A1234AA',
    probationPractitioner: {
      name: 'Test Com 1',
      staffCode: 'ABC123',
    },
    releaseDate: '01/07/2025',
    releaseDateLabel: 'Confirmed release date',
    licenceStatus: LicenceStatus.APPROVED,
    tabType: CaViewCasesTab.FUTURE_RELEASES,
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isInHardStopPeriod: true,
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
    link: '/test1',
  },
  {
    kind: LicenceKind.CRD,
    licenceId: 2,
    name: 'Test Person 2',
    prisonerNumber: 'A1234AB',
    probationPractitioner: {
      name: '',
    },
    releaseDate: '01/08/2025',
    releaseDateLabel: 'CRD',
    licenceStatus: LicenceStatus.SUBMITTED,
    tabType: CaViewCasesTab.FUTURE_RELEASES,
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isInHardStopPeriod: false,
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
    link: '/test2',
  },
]

const onProbationResults = [
  {
    kind: LicenceKind.CRD,
    licenceId: 1,
    name: 'Test Person 1',
    prisonerNumber: 'A1234AA',
    probationPractitioner: {
      name: 'Test Com 1',
      staffCode: 'ABC123',
    },
    releaseDate: '01/07/2025',
    releaseDateLabel: 'Confirmed release date',
    licenceStatus: LicenceStatus.ACTIVE,
    tabType: CaViewCasesTab.FUTURE_RELEASES,
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isInHardStopPeriod: true,
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
    link: '/test1',
  },
  {
    kind: LicenceKind.CRD,
    licenceId: 2,
    name: 'Test Person 2',
    prisonerNumber: 'A1234AB',
    probationPractitioner: {
      name: '',
    },
    releaseDate: '01/08/2025',
    releaseDateLabel: 'CRD',
    licenceStatus: LicenceStatus.ACTIVE,
    tabType: CaViewCasesTab.FUTURE_RELEASES,
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isInHardStopPeriod: false,
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
    link: '/test1',
  },
]

const attentionNeededResults = [
  {
    kind: 'CRD',
    licenceId: 1,
    name: 'Test Person 1',
    prisonerNumber: 'A1234AA',
    probationPractitioner: {
      name: 'Test Com 1',
      staffCode: 'A12345',
    },
    releaseDate: '01/11/2022',
    releaseDateLabel: 'CRD',
    licenceStatus: 'SUBMITTED',
    tabType: CaViewCasesTab.ATTENTION_NEEDED,
    nomisLegalStatus: 'RECALL',
    lastWorkedOnBy: 'Test Updater',
    isInHardStopPeriod: true,
    prisonCode: 'MDI',
    prisonDescription: 'Moorland (HMP)',
  },
]

describe('View CA Search Results', () => {
  it('should display empty states correctly when no search results are found', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 0,
          tabHeading: 'People in prison (0 results)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation (0 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 0,
        },
      },
      inPrisonResults: [],
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasSelectedMultiplePrisonCaseloads: false,
      isSearchPageView: true,
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (0 results)')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (0 results)')
    expect($('#tab-heading-prison').text()).toContain('People in prison (0 results)')
    expect($('#tab-heading-probation').text()).toContain('People on probation (0 results)')
    expect($('#people-in-prison-empty-state-content').text()).toContain(
      'You can see licences for people in prison in this service if they:',
    )
    expect($('#people-on-probation-empty-state-content').text()).toContain(
      'You can see licences for people on probation in this service if they:',
    )
  })

  it('should display the results in a table with links to the licence and COM details page for the people in prison tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 2,
          tabHeading: 'People in prison (2 results)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation (0 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 0,
        },
      },
      inPrisonResults,
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasSelectedMultiplePrisonCaseloads: false,
      isSearchPageView: true,
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (2 results)')
    expect($('#tab-heading-prison').text()).toContain('People in prison (2 results)')
    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .search-offender-name > a').text()).toBe('Test Person 1')
    expect($('#name-1 > .search-offender-name > a').attr('href').trim()).toBe('/test1')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#probation-practitioner-1').text()).toBe('Test Com 1')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/view/probation-practitioner/staffCode/ABC123',
    )

    expect($('thead').text()).not.toContain('Location')

    expect($('#release-date-1').text()).toBe('Confirmed release date: 1 Jul 2025')
    expect($('#licence-last-worked-on-by-1').text()).toBe('Test Updater')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Approved')

    expect($('#name-2 > .search-offender-name > a').text()).toBe('Test Person 2')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#probation-practitioner-2').text()).toBe('Unallocated')
    expect($('#release-date-2').text()).toBe('CRD: 1 Aug 2025')
    expect($('#licence-last-worked-on-by-2').text()).toBe('Test Updater')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Submitted')
  })

  it('should display the results in a table with links to the licence and COM details page for the people on probation tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-on-probation',
        prison: {
          resultsCount: 0,
          tabHeading: 'People in prison (0 results)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 2,
          tabHeading: 'People on probation (2 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 0,
        },
      },
      inPrisonResults: [],
      onProbationResults,
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasSelectedMultiplePrisonCaseloads: false,
      isSearchPageView: true,
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (2 results)')
    expect($('#tab-heading-probation').text()).toContain('People on probation (2 results)')
    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .search-offender-name > a').text()).toBe('Test Person 1')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#probation-practitioner-1').text()).toBe('Test Com 1')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/view/probation-practitioner/staffCode/ABC123',
    )
    expect($('thead').text()).not.toContain('Location')

    expect($('#release-date-1').text()).toBe('Confirmed release date: 1 Jul 2025')
    expect($('#licence-last-worked-on-by-1').text()).toBe('Test Updater')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Active')

    expect($('#name-2 > .search-offender-name > a').text()).toBe('Test Person 2')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#probation-practitioner-2').text()).toBe('Unallocated')
    expect($('#release-date-2').text()).toBe('CRD: 1 Aug 2025')
    expect($('#licence-last-worked-on-by-2').text()).toBe('Test Updater')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Active')
  })

  it('should display the results in a table without links to the licence and with links to the assigned COM details page for the attention needed tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 1,
          tabHeading: 'People in prison (1 result)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation (0 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 1,
        },
      },
      inPrisonResults: [],
      onProbationResults: [],
      attentionNeededResults,
      CaViewCasesTab,
      showAttentionNeededTab: true,
      hasSelectedMultiplePrisonCaseloads: false,
      isSearchPageView: true,
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Attention needed (1 result)')
    expect($('div #attention-needed').text()).toContain('Attention needed')
    expect($('div #attention-needed > .govuk-table > .govuk-table__body > .govuk-table__row').length).toBe(1)
    expect($('#nomis-legal-status-1').text()).toBe('Recall')
    expect($('#name-1').text()).toContain('Test Person 1')
    expect($('#name-1 > .caseload-offender-name > a').attr('href')).toBe(undefined)
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#com-1').text()).toBe('Test Com 1')
    expect($('#com-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/view/probation-practitioner/staffCode/A12345?activeTab=attention-needed',
    )

    expect($('thead').text()).not.toContain('Location')

    expect($('#release-date-1').text()).toContain('CRD: 1 Nov 2022')
  })

  it('should display the location column with data when the user has selected multiple prison caseloads', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 3,
          tabHeading: 'People in prison (3 results)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation (0 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 0,
        },
      },
      inPrisonResults: [
        ...inPrisonResults,
        {
          kind: LicenceKind.CRD,
          licenceId: 3,
          name: 'Test Person 3',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: '',
          },
          releaseDate: '01/08/2025',
          releaseDateLabel: 'CRD',
          licenceStatus: LicenceStatus.SUBMITTED,
          tabType: CaViewCasesTab.FUTURE_RELEASES,
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isInHardStopPeriod: false,
          prisonCode: 'WSI',
          prisonDescription: 'Wormwood Scrubs (HMP)',
          link: '/test3',
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasSelectedMultiplePrisonCaseloads: true,
      isSearchPageView: true,
    })
    expect($('thead').text()).toContain('Location')
    expect($('#location-1').text()).toBe('Moorland (HMP)')
    expect($('#location-2').text()).toBe('Moorland (HMP)')
    expect($('#location-3').text()).toBe('Wormwood Scrubs (HMP)')
  })

  it('should display the location column with data on the attention needed tab when the user has selected multiple prison caseloads', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 0,
          tabHeading: 'People in prison (0 results)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation (0 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 2,
        },
      },
      inPrisonResults: [],
      onProbationResults: [],
      attentionNeededResults: [
        ...attentionNeededResults,
        {
          kind: 'CRD',
          licenceId: 2,
          name: 'Test Person 2',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Test Com 1',
            staffCode: 'A12345',
          },
          releaseDate: 'not found',
          releaseDateLabel: 'CRD',
          licenceStatus: 'SUBMITTED',
          tabType: CaViewCasesTab.ATTENTION_NEEDED,
          nomisLegalStatus: 'RECALL',
          lastWorkedOnBy: 'Test Updater',
          isInHardStopPeriod: true,
          prisonCode: 'WSI',
          prisonDescription: 'Wormwood Scrubs (HMP)',
        },
      ],
      CaViewCasesTab,
      showAttentionNeededTab: true,
      hasSelectedMultiplePrisonCaseloads: true,
      isSearchPageView: true,
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Attention needed (2 results)')
    expect($('div #attention-needed').text()).toContain('Attention needed')
    expect($('div #attention-needed > .govuk-table > .govuk-table__body > .govuk-table__row').length).toBe(2)
    expect($('thead').text()).toContain('Location')
    expect($('#location-1').text()).toBe('Moorland (HMP)')
    expect($('#location-2').text()).toBe('Wormwood Scrubs (HMP)')
  })

  it('should hide attention needed tab when no attention needed cases are present', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 2,
          tabHeading: 'People in prison (2 results)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation (0 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 0,
        },
      },
      inPrisonResults,
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasSelectedMultiplePrisonCaseloads: false,
      isSearchPageView: true,
    })
    expect($('.govuk-tabs__list-item--selected').text()).toContain('People in prison (2 results)')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (2 results)')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (0 results)')
    expect($('.govuk-tabs__list a').text()).not.toContain('Attention needed')
  })

  it('should highlight a HDC licence with a HDC release warning label in prison view for the attention needed tab', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 1,
          tabHeading: 'People in prison (1 results)',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation (0 results)',
          tabId: 'tab-heading-probation',
        },
        attentionNeeded: {
          resultsCount: 1,
        },
      },
      inPrisonResults: [
        {
          kind: LicenceKind.HDC,
          licenceId: 1,
          name: 'Test Person 1',
          prisonerNumber: 'A1234AA',
          probationPractitioner: {
            name: 'Test Com 1',
            staffCode: 'ABC123',
          },
          releaseDate: '03/08/2022',
          releaseDateLabel: 'HDCAD',
          licenceStatus: LicenceStatus.APPROVED,
          tabType: 'ATTENTION_NEEDED',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/test1',
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: true,
      hasSelectedMultiplePrisonCaseloads: false,
      isSearchPageView: true,
    })
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-button-1').text()).toBe('Test Person 1')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('HDCAD: 3 Aug 2022HDC release')
  })
})
