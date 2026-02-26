import fs from 'fs'

import LicenceStatus from '../../../../enumeration/licenceStatus'
import statusConfig from '../../../../licences/licenceStatus'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import LicenceKind from '../../../../enumeration/LicenceKind'
import config from '../../../../config'

interface ProbationPractitioner {
  name: string
  staffCode: string
  allocated: boolean
}

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/probationSearch/probationSearch.njk').toString(),
)

describe('View Probation Search Results', () => {
  it('should display the results in a table with links to the licence and COM details page when a licence is available', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
        },
      ],
      peopleOnProbation: [],
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
      '/licence/create/probation-practitioner/staffCode/3000',
    )
    expect($('#team-name-1').text()).toBe('Test Team')
    expect($('#release-date-1').text()).toBe('CRD: 16 Aug 2023')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
  })

  it('should display Not allocated when com is not given', () => {
    const $ = render({
      statusConfig,
      peopleOnProbation: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
        },
      ],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#probation-practitioner-1').text().trim()).toBe('Not allocated')
  })

  it('should display prison name link if on isOnProbation', () => {
    const $ = render({
      statusConfig,
      peopleOnProbation: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: true,
          releaseDateLabel: 'CRD',
        },
      ],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href').trim()).toBe('/licence/vary/id/1/timeline')
  })

  it('should display prison created link if on time served', () => {
    const $ = render({
      statusConfig,
      peopleOnProbation: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: false,
          kind: 'TIME_SERVED',
        },
      ],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href').trim()).toBe(
      '/licence/create/nomisId/A1234BC/prison-will-create-this-licence',
    )
  })

  it('should display prison will create link when case is Timed Out', () => {
    const $ = render({
      statusConfig,
      peopleOnProbation: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.TIMED_OUT,
          isOnProbation: false,
          kind: 'TIME_SERVED',
        },
      ],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href').trim()).toBe(
      '/licence/create/nomisId/A1234BC/prison-will-create-this-licence',
    )
  })

  it('should display the results in a table with links to create a licence and COM details page when a licence is not available', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: null,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.NOT_STARTED,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
        },
      ],
      peopleOnProbation: [],
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
      '/licence/create/probation-practitioner/staffCode/3000',
    )
    expect($('#team-name-1').text()).toBe('Test Team')
    expect($('#release-date-1').text()).toBe('CRD: 16 Aug 2023')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')
  })

  it('should display the results in a table with no links when the COM is set to unallocated', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: null,
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: null,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.NOT_STARTED,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
        },
      ],
      peopleOnProbation: [],
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
    expect($('#probation-practitioner-1').text()).toBe('Not allocated')

    expect($('#team-name-1').text()).toBe('Test Team')
    expect($('#release-date-1').text()).toBe('CRD: 16 Aug 2023')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')
  })

  it('should display the release date as not found when release date is null', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: null,
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: '3000',
            allocated: false,
          },
          teamName: 'Test Team',
          releaseDate: '',
          licenceId: null,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.NOT_STARTED,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
        },
      ],
      peopleOnProbation: [],
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
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: null,
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: '3000',
            allocated: false,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: null,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.NOT_STARTED,
          isOnProbation: false,
          releaseDateLabel: 'Confirmed release date',
        },
      ],
      peopleOnProbation: [],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#release-date-1').text()).toBe('Confirmed release date: 16 Aug 2023')
  })

  it('should render licence-changes-not-approved-in-time page when licence status is TIMED_OUT and is a version', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.TIMED_OUT,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
          versionOf: 1,
        },
      ],
      peopleOnProbation: [],
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
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: null,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.TIMED_OUT,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
          kind: LicenceKind.CRD,
        },
      ],
      peopleOnProbation: [],
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
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: null,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
          kind: LicenceKind.HARD_STOP,
        },
      ],
      peopleOnProbation: [],
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
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 2,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.ACTIVE,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
          kind: LicenceKind.HARD_STOP,
        },
      ],
      peopleOnProbation: [],
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
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: null,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.NOT_STARTED,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
        },
      ],
      peopleOnProbation: [],
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
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '16/08/2023',
          licenceId: 3,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.NOT_STARTED,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
        },
      ],
      peopleOnProbation: [],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })
    expect($('#name-button-1').attr('href')).toBe('/licence/create/id/3/check-your-answers')
  })

  it('should highlight a HDC licence with a HDC release warning label in the people in prison tab', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '20/12/2025',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: false,
          releaseDateLabel: 'HDCAD',
          kind: LicenceKind.HDC,
        },
      ],
      peopleOnProbation: [],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })

    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
    expect($('#release-date-1').text()).toBe('HDCAD: 20 Dec 2025HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
  })

  it('should highlight a HDC licence with a HDC release warning label in the people on probation tab', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '20/12/2025',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.ACTIVE,
          isOnProbation: true,
          releaseDateLabel: 'HDCAD',
          kind: LicenceKind.HDC,
        },
      ],
      peopleOnProbation: [],
      tabParameters: {
        activeTab: '#people-on-probation',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })

    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Active')
    expect($('#release-date-1').text()).toBe('HDCAD: 20 Dec 2025HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
  })

  it('should highlight a HDC variation with a HDC release warning label in the people in prison tab', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '20/12/2025',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: false,
          releaseDateLabel: 'HDCAD',
          kind: LicenceKind.HDC_VARIATION,
        },
      ],
      peopleOnProbation: [],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
      hasPriorityCases: false,
    })

    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
    expect($('#release-date-1').text()).toBe('HDCAD: 20 Dec 2025HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
  })

  it('should highlight a HDC variation with a HDC release warning label in the people on probation tab', () => {
    const $ = render({
      statusConfig,
      peopleInPrison: [],
      peopleOnProbation: [
        {
          name: 'Test Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: '3000',
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: '3000',
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '20/12/2025',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.ACTIVE,
          isOnProbation: true,
          releaseDateLabel: 'HDCAD',
          kind: LicenceKind.HDC_VARIATION,
        },
      ],
      tabParameters: {
        activeTab: '#people-on-probation',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })

    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Active')
    expect($('#release-date-1').text()).toBe('HDCAD: 20 Dec 2025HDC release')
    expect($('.urgent-highlight-message').text().toString()).toEqual('HDC release')
  })

  it('renders release date for time-served when people in prison', () => {
    // Given
    const offenders = [
      {
        kind: 'TIME_SERVED',
        releaseDate: '01/07/2025',
        releaseDateLabel: 'CRD',
      },
    ].map((o, idx) => ({
      name: `Offender ${idx}`,
      crn: 'CRN',
      comName: 'Bob',
      comStaffCode: '123',
      probationPractitioner: {
        name: 'Bob',
        staffCode: '123',
        allocated: true,
      },
      teamName: 'AAA',
      licenceType: 'AP',
      licenceId: 1,
      licenceStatus: LicenceStatus.IN_PROGRESS,
      isOnProbation: false,
      ...o,
    }))

    // Given
    const $ = render({
      statusConfig,
      peopleInPrison: offenders,
      peopleOnProbation: [],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
    })

    // Then
    expect($('#release-date-1').text()).toBe('1 Jul 2025Time-served release')
  })

  it('renders release date for time-served when people people on probation', () => {
    // Given
    const offenders = [
      {
        kind: 'TIME_SERVED',
        releaseDate: '01/07/2025',
        releaseDateLabel: 'CRD',
      },
    ].map((o, idx) => ({
      name: `Offender ${idx}`,
      crn: 'CRN',
      comName: 'Bob',
      comStaffCode: '123',
      probationPractitioner: {
        name: 'Bob',
        staffCode: '123',
        allocated: true,
      },
      teamName: 'AAA',
      licenceType: 'AP',
      licenceId: 1,
      licenceStatus: LicenceStatus.IN_PROGRESS,
      isOnProbation: false,
      ...o,
    }))

    // Given
    const $ = render({
      statusConfig,
      peopleInPrison: [],
      peopleOnProbation: offenders,
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
    })

    // Then
    expect($('#release-date-1').text()).toBe('1 Jul 2025Time-served release')
  })

  it('should correctly show tab counts result counts', () => {
    // Given
    const peopleInPrison = [{ name: 'Person 1' }]
    const peopleOnProbation = [{ name: 'Person 1' }, { name: 'Person 2' }]

    // When
    const $ = render({
      statusConfig,
      peopleInPrison,
      peopleOnProbation,
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    })

    // Then
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (1 result)')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (2 results)')
  })

  it('should render offender name link when licence is TIMED_OUT and comName is missing, kind is not Time served or on prisoner is not on probation', () => {
    // Given
    const peopleOnProbation = [{}]

    const viewModel = {
      statusConfig,
      peopleInPrison: [
        {
          name: 'Timed Out Person',
          crn: 'A123456',
          nomisId: 'A1234BC',
          probationPractitioner: {
            name: 'Not allocated',
            staffCode: null,
            allocated: false,
          } as ProbationPractitioner,
          teamName: 'Test Team',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.TIMED_OUT,
          isOnProbation: false,
          releaseDate: '16/08/2023',
          releaseDateLabel: 'CRD',
        },
      ],
      peopleOnProbation,
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'Test',
    }

    // When
    const $ = render(viewModel)

    // Then
    expect($('#name-button-1').attr('href')).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
  })

  it('should display LAO offender with restricted information in people in prison tab', () => {
    config.laoEnabled = true
    const $ = render({
      statusConfig,
      peopleInPrison: [
        {
          name: 'Access restricted on NDelius',
          crn: 'A123456',
          nomisId: '',
          probationPractitioner: {
            name: 'Restricted',
            staffCode: 'Restricted',
            allocated: true,
          },
          licenceType: null,
          teamName: 'Restricted',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isOnProbation: false,
          releaseDateLabel: 'CRD',
          isLao: true,
        },
      ],
      peopleOnProbation: [],
      tabParameters: {
        activeTab: '#people-in-prison',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'A123456',
    })

    expect($('#name-1 > .search-offender-name > .govuk-heading-s').length).toBe(1)
    expect($('#name-1 > .search-offender-name > a').length).toBe(1)
    expect($('#name-1 > .search-offender-name').text()).toContain('Access restricted on NDelius')
    expect($('#name-1 > .search-offender-name > a').attr('href')).toContain('/A123456/restricted')
    expect($('#name-1 > .search-offender-name > .govuk-hint').text()).toBe('CRN: A123456')
    expect($('#licence-type-1').text().trim()).toBe('Restricted')
    expect($('#probation-practitioner-1').text()).toBe('Restricted')
    expect($('#probation-practitioner-1 > .govuk-link').length).toBe(0)
    expect($('#team-name-1').text()).toBe('Restricted')
    expect($('#release-date-1').text()).toBe('Restricted')
    expect($('#licence-status-1').text().trim()).toBe('Restricted')
  })

  it('should display LAO offender with restricted information in people on probation tab', () => {
    config.laoEnabled = true
    const $ = render({
      statusConfig,
      peopleInPrison: [],
      peopleOnProbation: [
        {
          name: 'Access restricted on NDelius',
          crn: 'A123456',
          nomisId: '',
          probationPractitioner: {
            name: 'Restricted',
            staffCode: 'Restricted',
            allocated: true,
          },
          licenceType: null,
          teamName: 'Restricted',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceStatus: LicenceStatus.ACTIVE,
          isOnProbation: true,
          releaseDateLabel: 'CRD',
          isLao: true,
        },
      ],
      tabParameters: {
        activeTab: '#people-on-probation',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'A123456',
    })

    expect($('#name-1 > .search-offender-name > a').length).toBe(1)
    expect($('#name-1 > .search-offender-name').text()).toContain('Access restricted on NDelius')
    expect($('#name-1 > .search-offender-name > a').attr('href')).toContain('/A123456/restricted')
    expect($('#name-1 > .search-offender-name > .govuk-hint').text()).toBe('CRN: A123456')
    expect($('#licence-type-1').text().trim()).toBe('Restricted')
    expect($('#probation-practitioner-1').text()).toBe('Restricted')
    expect($('#probation-practitioner-1 > .govuk-link').length).toBe(0)
    expect($('#team-name-1').text()).toBe('Restricted')
    expect($('#release-date-1').text()).toBe('Restricted')
    expect($('#licence-status-1').text().trim()).toBe('Restricted')
  })

  it('should not display probation practitioner name as link when LAO and is on probation', () => {
    config.laoEnabled = true
    const $ = render({
      statusConfig,
      peopleInPrison: [],
      peopleOnProbation: [
        {
          name: 'Access restricted on NDelius',
          crn: 'A123456',
          nomisId: '',
          probationPractitioner: {
            name: 'Restricted',
            staffCode: 'Restricted',
            allocated: true,
          },
          licenceType: null,
          teamName: 'Restricted',
          releaseDate: '16/08/2023',
          licenceId: 1,
          licenceStatus: LicenceStatus.ACTIVE,
          isOnProbation: true,
          releaseDateLabel: 'CRD',
          isLao: true,
        },
      ],
      tabParameters: {
        activeTab: '#people-on-probation',
        prisonTabId: 'tab-heading-prison',
        probationTabId: 'tab-heading-probation',
      },
      queryTerm: 'A123456',
    })

    expect($('#probation-practitioner-1').text()).toBe('Restricted')
    expect($('#probation-practitioner-1 > .govuk-link').length).toBe(0)
  })
})
