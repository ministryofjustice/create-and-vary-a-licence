import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../../utils/nunjucksSetup'
import ConditionService from '../../../../services/conditionService'
import LicenceStatus from '../../../../enumeration/licenceStatus'
import statusConfig from '../../../../licences/licenceStatus'

const snippet = fs.readFileSync('server/views/pages/search/probationSearch/probationSearch.njk')

describe('View Probation Search Results', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display the results in a table', () => {
    viewContext = {
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
      queryTerm: 'Test',
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#probation-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('People in prison (1 result)')
    expect($('.govuk-tabs__list a').text()).toContain('People on probation (0 results)')
    expect($('.govuk-tabs__list-item--selected').text()).toContain('People in prison (1 result)')

    expect($('#tab-heading').text()).toContain('People in prison (1 result)')
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > .search-offender-name > a').text()).toBe('Test Person')
    expect($('#name-1 > .search-offender-name > .govuk-hint').text()).toBe('CRN: A123456')
    expect($('#licence-type-1').text().trim()).toBe('Standard determinate')
    expect($('#probation-practitioner-1').text()).toBe('Test Staff')
    expect($('#team-name-1').text()).toBe('Test Team')
    expect($('#release-date-1').text()).toBe('2023-08-16')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('In progress')
  })
})