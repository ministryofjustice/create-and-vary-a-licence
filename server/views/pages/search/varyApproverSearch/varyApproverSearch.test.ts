import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/varyApproverSearch/varyApproverSearch.njk').toString(),
)

describe('View Prison Vary Approver Search Results', () => {
  it('should display the header correctly', () => {
    const $ = render({
      queryTerm: 'Test',
    })
    expect($('#vary-approval-search-heading').text()).toBe('Search results for Test')
  })
})
