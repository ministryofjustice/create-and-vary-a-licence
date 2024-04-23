import fs from 'fs'

import LicenceStatus from '../../../../enumeration/licenceStatus'
import statusConfig from '../../../../licences/licenceStatus'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import LicenceKind from '../../../../enumeration/LicenceKind'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/probationSearch/probationSearch.njk').toString()
)

describe('View Probation Search Results', () => {
  it('should display the results in a table with links to the licence and COM details page when a licence is available', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: 1,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.IN_PROGRESS,
            isOnProbation: false,
            isDueForEarlyRelease: false,
            releaseDateLabel: 'CRD',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#probation-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (1 result)')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (0 results)')
    expect($('.govuk-tabs__list-item--selected').text()).toContain('People in prison (1 result)')

    expect($('#tab-heading-prison').text()).toContain('People in prison (1 result)')
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > .search-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .search-offender-name > .govuk-hint').text()).toBe('CRN: A123456')
    expect($('#name-1 > .search-offender-name > a').attr('href').trim()).toBe('/licence/create/id/1/check-your-answers')
    expect($('#licence-type-1').text().trim()).toBe('Standard determinate')
    expect($('#probation-practitioner-1').text()).toBe('Test Staff')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/create/probation-practitioner/staffCode/3000'
    )
    expect($('#team-name-1').text()).toBe('Test Team')
    expect($('#release-date-1').text()).toBe('CRD: 16 Aug 2023')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
  })

  it('should display the results in a table with links to create a licence and COM details page when a licence is not available', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isOnProbation: false,
            isDueForEarlyRelease: false,
            releaseDateLabel: 'CRD',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#probation-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (1 result)')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (0 results)')
    expect($('.govuk-tabs__list-item--selected').text()).toContain('People in prison (1 result)')

    expect($('#tab-heading-prison').text()).toContain('People in prison (1 result)')
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > .search-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .search-offender-name > .govuk-hint').text()).toBe('CRN: A123456')
    expect($('#name-1 > .search-offender-name > a').attr('href').trim()).toBe('/licence/create/nomisId/A1234BC/confirm')
    expect($('#licence-type-1').text().trim()).toBe('Standard determinate')
    expect($('#probation-practitioner-1').text()).toBe('Test Staff')
    expect($('#probation-practitioner-1 > .govuk-link').attr('href').trim()).toBe(
      '/licence/create/probation-practitioner/staffCode/3000'
    )
    expect($('#team-name-1').text()).toBe('Test Team')
    expect($('#release-date-1').text()).toBe('CRD: 16 Aug 2023')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')
  })

  it('should display the results in a table with no links when the COM is set to unallocated', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: null,
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isOnProbation: false,
            isDueForEarlyRelease: false,
            releaseDateLabel: 'CRD',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#probation-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (1 result)')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (0 results)')
    expect($('.govuk-tabs__list-item--selected').text()).toContain('People in prison (1 result)')

    expect($('#tab-heading-prison').text()).toContain('People in prison (1 result)')
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > .search-offender-name > .govuk-heading-s').text()).toBe('Test Person')
    expect($('#name-1 > .search-offender-name > .govuk-hint').text()).toBe('CRN: A123456')
    expect($('#licence-type-1').text().trim()).toBe('Standard determinate')
    expect($('#probation-practitioner-1').text()).toBe('Unallocated')

    expect($('#team-name-1').text()).toBe('Test Team')
    expect($('#release-date-1').text()).toBe('CRD: 16 Aug 2023')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')
  })

  it('should display the release date as not found when release date is null', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: null,
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isOnProbation: false,
            isDueForEarlyRelease: false,
            releaseDateLabel: 'CRD',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#release-date-1').text()).toBe('CRD: not found')
  })

  it('should display the release date label as Confirmed release date', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: null,
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isOnProbation: false,
            isDueForEarlyRelease: false,
            releaseDateLabel: 'Confirmed release date',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#release-date-1').text()).toBe('Confirmed release date: 16 Aug 2023')
  })

  it('should display Early release warning label when isDueForEarlyRelease flag is true', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: null,
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isOnProbation: false,
            isDueForEarlyRelease: true,
            releaseDateLabel: 'CRD',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#release-date-1').text()).toBe('CRD: 16 Aug 2023Early release')
  })

  it('should render licence-changes-not-approved-in-time page when licence status is TIMED_OUT and is a version', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: 1,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.TIMED_OUT,
            isOnProbation: false,
            isDueForEarlyRelease: true,
            releaseDateLabel: 'CRD',
            versionOf: 1,
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href')).toBe('/licence/create/id/1/licence-changes-not-approved-in-time')
  })

  it('should render prison-will-create-this-licence page when licence status is TIMED_OUT and not kind HARD_STOP', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.TIMED_OUT,
            isOnProbation: false,
            isDueForEarlyRelease: true,
            releaseDateLabel: 'CRD',
            kind: LicenceKind.CRD,
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href')).toBe('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
  })

  it('should render prison-will-create-this-licence page when licence status is IN_PROGRESS and is kind HARD_STOP', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.IN_PROGRESS,
            isOnProbation: false,
            isDueForEarlyRelease: true,
            releaseDateLabel: 'CRD',
            kind: LicenceKind.HARD_STOP,
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href')).toBe('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
  })

  it('should render licence-created-by-prison page when licence status is not IN_PROGRESS and is kind HARD_STOP', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: 2,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.ACTIVE,
            isOnProbation: false,
            isDueForEarlyRelease: true,
            releaseDateLabel: 'CRD',
            kind: LicenceKind.HARD_STOP,
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href')).toBe('/licence/create/id/2/licence-created-by-prison')
  })

  it('should render confirm create licence page when licence is not TIMED_OUT, not kind HARD_STOP with no licence Id', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: null,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isOnProbation: false,
            isDueForEarlyRelease: true,
            releaseDateLabel: 'CRD',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href')).toBe('/licence/create/nomisId/A1234BC/confirm')
  })

  it('should render check-your-answers page when licence is not TIMED_OUT, not kind HARD_STOP with licence Id', () => {
    const $ = render({
      statusConfig,
      searchResponse: {
        results: [
          {
            name: 'Test Person',
            crn: 'A123456',
            nomisId: 'A1234BC',
            comName: 'Test Staff',
            comStaffCode: '3000',
            teamName: 'Test Team',
            releaseDate: '16/08/2023',
            licenceId: 3,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isOnProbation: false,
            isDueForEarlyRelease: true,
            releaseDateLabel: 'CRD',
          },
        ],
        inPrisonCount: 1,
        onProbationCount: 0,
      },
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href')).toBe('/licence/create/id/3/check-your-answers')
  })
})
