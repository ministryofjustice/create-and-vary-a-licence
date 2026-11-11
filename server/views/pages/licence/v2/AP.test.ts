import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/licence/v2/AP.njk').toString())

describe('Print a V2 AP licence', () => {
  it('should render the v2 AP template', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP',
        version: '2.0',
      },
    })
    expect($('html').length).toBe(1)
  })

  it('renders the licence title and prison subtitle', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP',
        version: '2.0',
        kind: 'AP',
        prisonDescription: 'HMP Prison',
      },
      licenceTemplateV2Enabled: true,
    })

    expect($('#title').text()).toBe('Licence for John Smith')
    expect($('#subtitle').text()).toBe('Released from HMP Prison')
  })

  it('renders the first-meeting heading', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP',
        version: '2.0',
      },
    })

    const heading = $('#section-heading-first-meeting')
    expect(heading).toHaveLength(1)
    expect(heading.text()).toContain('Your first probation meeting')
  })
})
