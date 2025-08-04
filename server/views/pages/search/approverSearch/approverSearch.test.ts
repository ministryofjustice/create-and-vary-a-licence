import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/approverSearch/approverSearch.njk').toString(),
)

describe('View Prison Approver Search Results', () => {
  it('should display empty states correctly when no search results are found', () => {
    const $ = render({
      queryTerm: 'Test',
      tabParameters: {
        approvalNeeded: {
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          tabId: 'tab-heading-recently-approved',
        },
      },
    })
    expect($('#approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Approval needed')
    expect($('.govuk-tabs__list a').text()).toContain('Recently approved')
    expect($('#tab-heading-approval-needed').text()).toContain('Approval needed (0 results)')
    expect($('#tab-heading-recently-approved').text()).toContain('Recently approved (0 results)')
    expect($('#approval-search-empty-state-content').text()).toContain(
      'No licence approval requests that match "Test". Try searching again',
    )
  })
})
