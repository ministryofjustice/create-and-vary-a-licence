import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/initialAppointment/initialMeetingContact.njk').toString(),
)

describe('Initial meeting telephone number page', () => {
  describe('The page is correctly configured', () => {
    it('the heading is correct for the default route', () => {
      const $ = render({})
      expect($('h1.govuk-heading-l').text()).toBe('What is the contact phone number for the initial appointment?')
      expect($('[for="telephone"]').text().trim()).toBe('UK phone number')
      expect($('[for="telephoneAlternative"]').text().trim()).toBe('Alternative UK phone number (optional)')
    })

    it('the heading is correct when no appointment is needed', () => {
      const $ = render({ noAppointmentNeeded: true })
      expect($('h1.govuk-heading-l').text()).toBe(
        "What is the community probation practitioner's contact phone number?",
      )
    })
  })
})
