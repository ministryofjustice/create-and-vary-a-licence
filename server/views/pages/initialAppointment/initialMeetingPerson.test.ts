import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/initialAppointment/initialMeetingPerson.njk').toString(),
)

describe('appointmentPerson page', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const baseArgs = {
    applicationName: 'Test App',
    csrfToken: 'csrf-token',
    continueOrSave: 'Continue',
    licence: {},
    formResponses: {},
    validationErrors: [] as { text: string }[],
    appointmentPersonType: {
      DUTY_OFFICER: 'Duty officer',
      SPECIFIC_PERSON: 'Specific person',
    },
  }

  describe('when userType is probation', () => {
    it('shows radios with duty officer selected by default', () => {
      // Given
      const args = {
        ...baseArgs,
        userType: 'probation',
      }

      // When
      const $ = render(args)

      // Then
      expect($('input[type="radio"][name="appointmentPersonType"]').length).toBe(2)
      expect($('input[type="radio"][value="DUTY_OFFICER"]').is(':checked')).toBe(true)
      expect($('#contactName').length).toBe(1)
    })

    it('show the correct hint text when NO_APPOINTMENT option is available', () => {
      // Given
      const args = {
        ...baseArgs,
        userType: 'probation',
        appointmentPersonType: {
          DUTY_OFFICER: 'Duty officer',
          SPECIFIC_PERSON: 'Specific person',
          NO_APPOINTMENT_NEEDED: 'No appointment needed',
        },
      }

      // When
      const $ = render(args)

      // Then
      expect($('#appointmentPersonType-4-item-hint').text().trim()).toBe(
        'For people being released in the final third of a standard determinate sentence. Check the help section below for eligibility information.',
      )
      expect($('.govuk-details__summary-text').text().trim()).toBe('When no initial appointment is needed')
      expect($('.govuk-details__text').text()).toContain(
        'Select No appointment needed if the person is being released in the final third of a standard determinate sentence and is not:',
      )
      const bulletItems = $('.govuk-list--bullet li')
      expect(bulletItems.length).toBe(5)
      expect(bulletItems.eq(0).text().trim()).toBe('MAPPA eligible')
      expect(bulletItems.eq(1).text().trim()).toBe('named on a child protection plan')
      expect(bulletItems.eq(2).text().trim()).toBe('sentenced for a state threat or terrorist risk offence')
      expect(bulletItems.eq(3).text().trim()).toBe('tier A, B or C')
      expect(bulletItems.eq(4).text().trim()).toBe('serving a standard determinate sentence plus')
    })

    it('does not show hint text when NO_APPOINTMENT option is not available', () => {
      // Given
      const args = {
        ...baseArgs,
        userType: 'probation',
        appointmentPersonType: [
          ['DUTY_OFFICER', 'Duty officer'],
          ['SPECIFIC_PERSON', 'Specific person'],
        ],
      }

      // When
      const $ = render(args)

      // Then
      expect($('input[type="radio"][value="NO_APPOINTMENT_NEEDED"]').length).toBe(0)
      expect($('.govuk-details__summary-text').length).toBe(0)
    })

    it('selects value from formResponses when provided', () => {
      // Given
      const args = {
        ...baseArgs,
        userType: 'probation',
        formResponses: {
          appointmentPersonType: 'SPECIFIC_PERSON',
          contactName: 'Test Tester',
        },
      }

      // When
      const $ = render(args)

      // Then
      expect($('input[type="radio"][value="SPECIFIC_PERSON"]').is(':checked')).toBe(true)
      expect($('#contactName').val()).toBe('Test Tester')
    })
  })

  describe('when userType is not probation', () => {
    it('shows hidden appointmentPersonType and text input only', () => {
      // Given
      const args = {
        ...baseArgs,
        userType: 'prison',
      }

      // When
      const $ = render(args)

      // Then
      expect($('input[type="hidden"][name="appointmentPersonType"]').val()).toBe('SPECIFIC_PERSON')

      expect($('#contactName').length).toBe(1)
      expect($('input[type="radio"]').length).toBe(0)
    })
  })
})
