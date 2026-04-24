import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import AppointmentTimeType from '../../../../enumeration/appointmentTimeType'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/initialAppointment/prisonCreated/initialMeetingTime.njk').toString(),
)

describe('Prison created Initial appointment page accessibility', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const appointmentTimeType: Record<string, string> = AppointmentTimeType

  const defaultModel = {
    appointmentTimeType,
  }

  it('should render hint after the heading', () => {
    const $ = render({
      ...defaultModel,
    })

    const srHint = $('#initial-appointment-sr-hint')

    expect(srHint.hasClass('govuk-visually-hidden')).toBe(true)
    expect(srHint.text().trim()).toBe(
      'You will be able to provide more information if you choose a specific date and time for this appointment',
    )
  })

  it('should render selected, grouped, expanded radio option for specific date and time', () => {
    const $ = render({
      ...defaultModel,
      formResponses: {
        appointmentTimeType: 'SPECIFIC_DATE_TIME',
      },
    })

    const specificRadio = $('input[type="radio"][value="SPECIFIC_DATE_TIME"]')

    const label = $(`label[for="${specificRadio.attr('id')}"]`)
    expect(label.text().trim()).toBe('At a specific date and time')

    expect(specificRadio.prop('checked')).toBe(true)

    expect(specificRadio.attr('type')).toBe('radio')

    const radiosInGroup = $('input[type="radio"][name="appointmentTimeType"]')
    expect(radiosInGroup.length).toBe(3)

    expect(specificRadio.attr('aria-expanded')).toBe('true')
  })

  it('should use custom screen reader text for calendar button', () => {
    const $ = render({
      ...defaultModel,
      formResponses: {
        date: {
          calendarDate: '2024-10-31',
        },
        time: {
          time: '09:30',
          ampm: 'am',
        },
      },
      formDate: {
        date: {
          calendarDate: '2024-10-31',
        },
        time: {
          time: '09:30',
          ampm: 'am',
        },
      },
    })

    const calendarButton = $('.hmpps-datepicker-button')
    const srText = calendarButton.find('.govuk-visually-hidden').text().trim()
    expect(srText).toBe('Select date from calendar')
  })

  it('should use custom screen reader text for AM / PM dropdown', () => {
    const $ = render({
      ...defaultModel,
      formResponses: {
        date: {
          calendarDate: '2024-10-31',
        },
        time: {
          time: '09:30',
          ampm: 'am',
        },
      },
      formDate: {
        date: {
          calendarDate: '2024-10-31',
        },
        time: {
          time: '09:30',
          ampm: 'am',
        },
      },
    })

    const ampmSelect = $('#time-ampm')
    expect(ampmSelect.attr('aria-label')).toBe('Choose AM or PM')
  })
})
