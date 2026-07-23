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

describe('heading', () => {
  it('shows the correct heading when noAppointmentNeeded is true', () => {
    const $ = render({
      licence: {},
      noAppointmentNeeded: true,
    })
    expect($('h1.govuk-heading-l').text().trim()).toBe('What contact address should be shown on the licence?')
  })

  it('when noAppointmentNeeded is false the heading should read "Where is the initial appointment?"', () => {
    const $ = render({
      licence: {},
      noAppointmentNeeded: false,
    })
    expect($('h1.govuk-heading-l').text().trim()).toBe('Where is the initial appointment?')
  })
})
