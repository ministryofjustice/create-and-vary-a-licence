import fs from 'fs'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/hardStop/confirmCreate.njk').toString())

describe('Caseload', () => {
  it('should display standard conditions text', () => {
    const $ = render({
      licence: {
        licenceType: 'AP',
      },
    })
    expect($('.licence-conditions').text().toString()).toContain('standard conditions')
  })

  it('should display post sentence supervision text', () => {
    const $ = render({
      licence: {
        licenceType: 'PSS',
      },
    })
    expect($('.licence-conditions').text().toString()).toContain(
      'This licence contains standard post sentence supervision requirements only by default.',
    )
  })
})
