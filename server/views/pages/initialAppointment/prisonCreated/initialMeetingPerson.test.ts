// server/views/pages/initialAppointment/prisonCreated/initialMeetingPerson.test.ts
import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/initialAppointment/prisonCreated/initialMeetingPerson.njk').toString(),
)

describe('prisonCreated - appointmentPerson page', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const baseArgs = {
    applicationName: 'Test App',
    csrfToken: 'csrf-token',
    continueOrSaveLabel: 'Continue',
    licence: {},
    formResponses: {},
    validationErrors: [] as { field: string; message: string }[],
    appointmentPersonType: {
      DUTY_OFFICER: 'Duty officer',
      SPECIFIC_PERSON: 'Specific person',
    },
  }

  it('renders the page title, heading and button correctly', () => {
    const $ = render(baseArgs)

    expect($('title').text()).toContain('Create a licence - Who is the initial appointment with?')
    expect($('h1 label').text().trim()).toBe('Who is the initial appointment with?')
    expect($('[data-qa="continue"]').text().trim()).toBe('Continue')
  })

  it('form is correctly configured with duty officer selected by default', () => {
    const $ = render(baseArgs)

    expect($('input[type="radio"][name="appointmentPersonType"]').length).toBe(2)
    expect($('input[type="radio"][value="DUTY_OFFICER"]').is(':checked')).toBe(true)

    expect($('#contactName').length).toBe(1)
    expect($('#contactName').attr('name')).toBe('contactName')

    const hintText = $('#appointmentPersonType-2-item-hint').text().trim()
    expect(hintText).toBe(
      'For example, someone at an approved premises or a different community probation practitioner.',
    )
  })

  it('shows a divider and hint when NO_APPOINTMENT_NEEDED option is available', () => {
    const args = {
      ...baseArgs,
      appointmentPersonType: {
        DUTY_OFFICER: 'Duty officer',
        SPECIFIC_PERSON: 'Specific person',
        NO_APPOINTMENT_NEEDED: 'No appointment needed',
      },
    }

    const $ = render(args)

    expect($('input[type="radio"][value="NO_APPOINTMENT_NEEDED"]').length).toBe(1)
    expect($('.govuk-radios__divider').text().trim()).toBe('or')
    expect($('#appointmentPersonType-4-item-hint').text().trim()).toBe(
      'Select this only if the community probation team have confirmed that this person is being released in the final third of a standard determinate sentence and does not require an appointment.',
    )
  })

  it('displays validation error when present', () => {
    const args = {
      ...baseArgs,
      validationErrors: [{ field: 'contactName', message: 'Enter a name or job title' }],
    }

    const $ = render(args)

    expect($('.govuk-form-group--error').length).toBe(1)
    expect($('.govuk-error-message').text()).toContain('Enter a name or job title')
    expect($('#contactName').hasClass('govuk-input--error')).toBe(true)
  })
})
