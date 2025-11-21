import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/initialAppointment/initialMeetingPlace.njk').toString(),
)

describe('postcodeLookupEnabled', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('shows postcode lookup when postcodeLookupEnabled is true', () => {
    const $ = render({
      postcodeLookupEnabled: true,
      licence: {},
    })
    expect($('label[for="searchQuery"]').text()).toContain('Type an address or postcode')
    expect($('[data-qa="searchAddresses"]').length).toBe(1)
    expect($('#addressLine1').length).toBe(0)
  })

  it('shows manual address fields when postcodeLookupEnabled is false', () => {
    const $ = render({
      postcodeLookupEnabled: false,
      licence: {},
    })
    expect($('label[for="addressLine1"]').length).toBe(1)
    expect($('label[for="addressPostcode"]').text()).toContain('Postcode')
    expect($('[data-qa="searchAddresses"]').length).toBe(0)
  })
})
