import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/licence/v2/HDC_AP.njk').toString())

describe('Print a V2 HDC AP licence', () => {
  it('should render the v2 HDC AP template', () => {
    const $ = render({
      licence: {
        id: 1,
        kind: 'HDC',
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP',
        version: '2.0',
        prisonCode: 'MDI',
      },
    })
    expect($('html').length).toBe(1)
  })
})
