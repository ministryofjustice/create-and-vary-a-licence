import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/varyApproverSearch/varyApproverSearch.njk').toString(),
)

describe('View Prison Vary Approver Search Results', () => {
  it('should display empty states correctly when no search results are found', () => {
    const $ = render({
      queryTerm: 'Test',
      tabParameters: {
        pduCases: {
          tabId: 'tab-heading-pdu-cases',
        },
        regionCases: {
          tabId: 'tab-heading-region-cases',
        },
      },
    })
    expect($('#vary-approval-search-heading').text()).toBe('Search results for Test')
    expect($('.govuk-tabs__list a').text()).toContain('Cases in this PDU')
    expect($('.govuk-tabs__list a').text()).toContain('All cases in this region')
    expect($('#tab-heading-pdu-cases').text()).toContain('Cases in this PDU (0 results)')
    expect($('#tab-heading-region-cases').text()).toContain('All cases in this region (0 results)')
    expect($('#vary-approval-search-empty-state-content').text()).toContain(
      `No licence variation requests that match 'Test'. Try searching again`,
    )
  })
})
