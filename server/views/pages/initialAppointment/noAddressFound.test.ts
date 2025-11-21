import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/initialAppointment/noAddressFound.njk').toString())

describe('noAddressFound', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders correct postcode', () => {
    const licenceId = '12345'
    const searchQuery = 'AB12CD'

    const $ = render({
      searchQuery,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place`,
    })

    expect($('.govuk-body').text()).toContain(`We could not find an address that matches ${searchQuery}`)
  })

  it('render search again link with correct URL', () => {
    const licenceId = '12345'
    const searchQuery = 'AB12CD'

    const $ = render({
      searchQuery,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place`,
    })

    const searchAgainLink = $('[data-qa="searchAgain"]')
    expect(searchAgainLink.text()).toContain('Search again')
    expect(searchAgainLink.attr('href')).toBe(`/licence/create/id/${licenceId}/initial-meeting-place`)
  })
})
