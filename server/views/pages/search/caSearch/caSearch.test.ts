import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/search/caSearch/caSearch.njk').toString())

describe('View CA Search Results', () => {
  it('should display the header correctly', () => {
    const $ = render({
      queryTerm: 'Test',
    })
    expect($('#ca-search-heading').text()).toBe('Search results for Test')
  })
})
