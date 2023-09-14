import fs from 'fs'

import LicenceStatus from '../../../../enumeration/licenceStatus'
import statusConfig from '../../../../licences/licenceStatus'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/probationSearch/probationSearch.njk').toString()
)

describe('View Probation Search Results', () => {
  it('should display the results in a table with links to the licence and COM details page', () => {
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
            releaseDate: '2023-08-16',
            licenceId: 1,
            licenceType: 'AP',
            licenceStatus: LicenceStatus.IN_PROGRESS,
            isOnProbation: false,
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
    expect($('#release-date-1').text()).toBe('2023-08-16')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
  })
})
