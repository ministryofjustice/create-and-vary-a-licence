import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/approverSearch/approverSearch.njk').toString(),
)

describe('View Prison Approver Search Results', () => {
  it('should display the header correctly', () => {
    const $ = render({
      queryTerm: 'Test',
    })
    expect($('#approval-search-heading').text()).toBe('Search results for Test')
  })
})
