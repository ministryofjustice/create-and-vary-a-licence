import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/search/caSearch/caSearch.njk').toString())

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
})
