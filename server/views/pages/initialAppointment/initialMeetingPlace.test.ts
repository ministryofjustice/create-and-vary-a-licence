import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/initialAppointment/initialMeetingPlace.njk').toString(),
)

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
