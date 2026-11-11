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

    expect($('.title')).toHaveLength(1)
    expect($('.title').text()).toBe('Licence for John Smith')
    expect($('.subtitle').text()).toBe('Released from HMP Prison')
  })

  it('renders the first meeting icon beside its heading', () => {
    const $ = render({
      licencesUrl: 'https://abc.com',
      licence: {
        id: 1,
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP',
        version: '2.0',
      },
    })

    const heading = $('#section-heading-first-meeting')
    const icon = heading.children('.section-heading__icon')
    expect(heading).toHaveLength(1)
    expect(heading.hasClass('section-heading')).toBe(true)
    expect(icon.attr('src')).toBe('https://abc.com/assets/images/TestIcon1.png')
    expect(icon.attr('alt')).toBe('')
    expect(icon.attr('aria-hidden')).toBe('true')
    expect(heading.text().trim()).toBe('Your first probation meeting')
  })
})
