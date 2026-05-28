import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/hdc/noCurfewAddressFound.njk').toString())

describe('No curfew address found', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders correct postcode', () => {
    const licenceId = '12345'
    const searchQuery = 'AB12CD'

    const $ = render({
      searchQuery,
      curfewAddressSearchUrl: `/licence/vary/id/${licenceId}/hdc/find-the-new-curfew-address`,
      manualAddressEntryUrl: `/licence/vary/id/${licenceId}/hdc/manual-curfew-address-entry`,
    })

    expect($('.govuk-body').text()).toContain(`We could not find an address that matches ${searchQuery}`)
  })

  it('render search again link with correct URL', () => {
    const licenceId = '12345'
    const searchQuery = 'AB12CD'

    const $ = render({
      searchQuery,
      curfewAddressSearchUrl: `/licence/vary/id/${licenceId}/hdc/find-the-new-curfew-address`,
      manualAddressEntryUrl: `/licence/vary/id/${licenceId}/hdc/manual-curfew-address-entry`,
    })

    const searchAgainLink = $('[data-qa="searchAgain"]')
    expect(searchAgainLink.text()).toContain('Search again')
    expect(searchAgainLink.attr('href')).toBe(`/licence/vary/id/${licenceId}/hdc/find-the-new-curfew-address`)
  })
})
