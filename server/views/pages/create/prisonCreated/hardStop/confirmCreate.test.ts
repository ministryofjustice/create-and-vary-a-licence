import fs from 'fs'

import { templateRenderer } from '../../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/create/prisonCreated/hardStop/confirmCreate.njk').toString(),
)

describe('Caseload', () => {
  it('should display standard conditions text', () => {
    const $ = render({
      licence: {
        licenceType: 'AP',
      },
    })
    expect($('.licence-conditions').text().toString()).toContain('standard conditions')
  })
})
