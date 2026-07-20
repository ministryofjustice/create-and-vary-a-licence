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
    appointmentPersonType: [
      ['DUTY_OFFICER', 'Duty officer'],
      ['SPECIFIC_PERSON', 'Specific person'],
    ],
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
