import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import LicenceKind from '../../../../enumeration/LicenceKind'
import LicenceStatus from '../../../../enumeration/licenceStatus'
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
    tabType: 'FUTURE_RELEASES',
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isDueForEarlyRelease: false,
    isInHardStopPeriod: true,
    prisonCode: 'BAI',
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
    tabType: 'FUTURE_RELEASES',
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isDueForEarlyRelease: false,
    isInHardStopPeriod: false,
    prisonCode: 'WSI',
    prisonDescription: 'Wormwood Scrubs (HMP)',
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
    tabType: 'FUTURE_RELEASES',
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isDueForEarlyRelease: false,
    isInHardStopPeriod: true,
    prisonCode: 'BAI',
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
    tabType: 'FUTURE_RELEASES',
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isDueForEarlyRelease: false,
    isInHardStopPeriod: false,
    prisonCode: 'BAI',
    prisonDescription: 'Moorland (HMP)',
    link: '/test1',
  },
]

describe('View CA Search Results', () => {
  it('should display empty states correctly when no search results are found', () => {
    const $ = render({
      queryTerm: 'Test',
      tabParameters: {
        prison: {
          tabId: 'tab-heading-prison',
        },
        probation: {
          tabId: 'tab-heading-probation',
        },
      },
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation')
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
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults,
      onProbationResults: [],
      worksAtMoreThanOnePrison: false,
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison')
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

    expect($('#release-date-1').text()).toBe('Confirmed release date: 01 Jul 2025')
    expect($('#licence-last-worked-on-by-1').text()).toBe('Test Updater')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Approved')

    expect($('#name-2 > .search-offender-name > a').text()).toBe('Test Person 2')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#probation-practitioner-2').text()).toBe('Unallocated')
    expect($('#release-date-2').text()).toBe('CRD: 01 Aug 2025')
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
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 2,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults: [],
      onProbationResults,
      worksAtMoreThanOnePrison: false,
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation')
    expect($('#tab-heading-probation').text()).toContain('People on probation')
    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .search-offender-name > a').text()).toBe('Test Person 1')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#probation-practitioner-1').text()).toBe('Test Com 1')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/view/probation-practitioner/staffCode/ABC123',
    )
    expect($('thead').text()).not.toContain('Location')

    expect($('#release-date-1').text()).toBe('Confirmed release date: 01 Jul 2025')
    expect($('#licence-last-worked-on-by-1').text()).toBe('Test Updater')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Active')

    expect($('#name-2 > .search-offender-name > a').text()).toBe('Test Person 2')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#probation-practitioner-2').text()).toBe('Unallocated')
    expect($('#release-date-2').text()).toBe('CRD: 01 Aug 2025')
    expect($('#licence-last-worked-on-by-2').text()).toBe('Test Updater')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Active')
  })

  it('should display the location column with data when the user works at multiple prisons', () => {
    const $ = render({
      queryTerm: 'Test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 2,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults,
      onProbationResults: [],
      worksAtMoreThanOnePrison: true,
    })
    expect($('thead').text()).toContain('Location')
    expect($('#location-1').text()).toBe('Moorland (HMP)')
    expect($('#location-2').text()).toBe('Wormwood Scrubs (HMP)')
  })
})
