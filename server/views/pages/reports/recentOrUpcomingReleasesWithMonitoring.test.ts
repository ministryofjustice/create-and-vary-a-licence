import * as cheerio from 'cheerio'

import { registerNunjucks } from '../../../utils/nunjucksSetup'

describe('recentOrUpcomingReleasesWithMonitoring template', () => {
  const model = {
    applicationName: 'Create and vary a licence',
    releaseType: 'Upcoming',
    downloadCsvUrl: '/reports/upcoming-releases-with-monitoring/download-csv',
    upcomingCases: [
      {
        prisonNumber: 'A1234BC',
        fullName: 'Joe Bloggs',
        crn: 'CRN123',
        status: 'SUBMITTED',
        emConditionCodes: '12h, 45a, 78b',
        electronicMonitoringTypes: 'type1, type2, type3',
        emEndDate: '01/02/2024',
        licenceStartDate: '01/01/2024',
        submittedDate: '15/12/2023',
      },
      {
        prisonNumber: 'A1234BD',
        fullName: 'Fred Smith',
        crn: 'CRN124',
        status: 'SUBMITTED',
        emConditionCodes: '12h, 45a, 78b',
        electronicMonitoringTypes: 'type1, type2, type3',
        emEndDate: '01/02/2024',
        licenceStartDate: '01/02/2025',
        submittedDate: '22/12/2024',
      },
    ],
  }

  test('renders the page title, summary text, and table data for upcoming releases', async () => {
    const env = registerNunjucks()
    const template = await env.getTemplate('pages/reports/recentOrUpcomingReleasesWithMonitoring.njk')
    const html = template.render(model)
    const $ = cheerio.load(html)

    expect($('h1').text()).toContain('Upcoming Releases with electronic monitoring conditions')
    expect($('h2').text()).toContain('There are 2 upcoming releases')
    expect($('.govuk-button--secondary').length).toBe(1)
    expect($('.govuk-button--secondary').text()).toContain('Download CSV')
    expect($('.govuk-button--secondary').attr('href')).toContain(
      '/reports/upcoming-releases-with-monitoring/download-csv',
    )
    expect($('table').text()).toContain('A1234BC')
    expect($('table').text()).toContain('Joe Bloggs')
    expect($('table').text()).toContain('CRN123')
    expect($('table').text()).toContain('A1234BD')
    expect($('table').text()).toContain('Fred Smith')
    expect($('table').text()).toContain('CRN124')
  })
})
