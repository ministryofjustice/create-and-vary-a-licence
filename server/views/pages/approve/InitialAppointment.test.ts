import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import { Licence } from '../../../@types/licenceApiClientTypes'

const render = templateRenderer(
  '{% from "pages/approve/InitialAppointment.njk" import InitialAppointment %}{{ InitialAppointment(options)}}',
)

const licence = {
  id: 1,
  kind: 'CRD',
  statusCode: 'APPROVED',
  typeCode: 'AP_PSS',
  forename: 'John',
  surname: 'Smith',
  appointmentTime: '18/10/2024 01:02',
  appointmentTimeType: 'SPECIFIC_DATE_TIME',
  appointmentPersonType: 'SPECIFIC_PERSON',
  appointmentPerson: 'Jack Frost',
  appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
  responsibleComFullName: 'COM',
  bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
} as Licence

describe('View Initial appointment details - approve licence', () => {
  it('should display a separate date and time fields', () => {
    const $ = render({ options: licence })
    expect($('#initial-appointment-details > .govuk-summary-list__row').length).toBe(4)
    expect($('#initial-appointment-details  > div:nth-child(3) > dt').text()).toContain('Date')
    expect($('#initial-appointment-details  > div:nth-child(4) > dt').text()).toContain('Time')
  })

  it('should display a date/time field', () => {
    const $ = render({
      options: {
        ...licence,
        appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      },
    })
    expect($('#initial-appointment-details > .govuk-summary-list__row').length).toBe(3)
    expect($('#initial-appointment-details > div:nth-child(3) > dt').text()).toContain('Date/time')
  })

  it('should display appointment person based on the appointment person type selected', () => {
    const $ = render({
      options: {
        ...licence,
      },
    })
    expect($('#initial-appointment-details > div:nth-child(1) > dd').text().trim()).toBe('Jack Frost')
    const $2 = render({
      options: {
        ...licence,
        appointmentPersonType: 'DUTY_OFFICER',
      },
    })
    expect($2('#initial-appointment-details > div:nth-child(1) > dd').text().trim()).toBe('Duty officer')
    const $3 = render({
      options: {
        ...licence,
        appointmentPersonType: 'RESPONSIBLE_COM',
      },
    })
    expect($3('#initial-appointment-details > div:nth-child(1) > dd').text().trim()).toBe('COM')
  })
})
