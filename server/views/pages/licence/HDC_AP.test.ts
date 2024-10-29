import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import type { Licence } from '../../../@types/licenceApiClientTypes'

const render = templateRenderer(fs.readFileSync('server/views/pages/licence/HDC_AP.njk').toString())

describe('Print a HDC AP licence', () => {
  it('verify render of an AP licence', () => {
    const $ = render({
      licence: {
        id: 1,
        kind: 'HDC',
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP',
        version: '1.0',
        prisonCode: 'MDI',
        appointmentPerson: 'Jack Frost',
        appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
        comTelephone: '07878 234566',
        standardLicenceConditions: [
          { code: '1', text: 'Standard 1' },
          { code: '2', text: 'Standard 2' },
          { code: '3', text: 'Standard 3' },
          { code: '4', text: 'Standard 4' },
          { code: '5', text: 'Standard 5' },
          { code: '6', text: 'Standard 6' },
          { code: '7', text: 'Standard 7' },
        ],
        additionalLicenceConditions: [
          {
            expandedText:
              'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your drug and alcohol problems.',
          },
        ],
        bespokeConditions: [{ text: 'Bespoke condition 1' }],
      },
      qrCodesEnabled: false,
      singleItemConditions: [
        {
          expandedText:
            'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your drug and alcohol problems.',
          uploadSummary: [],
        },
      ],
      multipleItemConditions: [],
      hdcLicenceData: {
        curfewAddress: {
          addressLine1: 'addressLineOne',
          addressLine2: 'addressLineTwo',
          addressTown: 'addressTownOrCity',
          postCode: 'addressPostcode',
        },
        firstNightCurfewHours: {
          firstNightFrom: '09:00',
          firstNightUntil: '17:00',
        },
        curfewTimes: [
          {
            curfewTimesSequence: 1,
            fromDay: 'MONDAY',
            fromTime: '17:00:00',
            untilDay: 'TUESDAY',
            untilTime: '09:00:00',
          },
          {
            curfewTimesSequence: 2,
            fromDay: 'TUESDAY',
            fromTime: '17:00:00',
            untilDay: 'WEDNESDAY',
            untilTime: '09:00:00',
          },
          {
            curfewTimesSequence: 3,
            fromDay: 'WEDNESDAY',
            fromTime: '17:00:00',
            untilDay: 'THURSDAY',
            untilTime: '09:00:00',
          },
          {
            curfewTimesSequence: 4,
            fromDay: 'THURSDAY',
            fromTime: '17:00:00',
            untilDay: 'FRIDAY',
            untilTime: '09:00:00',
          },
          {
            curfewTimesSequence: 5,
            fromDay: 'FRIDAY',
            fromTime: '17:00:00',
            untilDay: 'SATURDAY',
            untilTime: '09:00:00',
          },
          {
            curfewTimesSequence: 6,
            fromDay: 'SATURDAY',
            fromTime: '17:00:00',
            untilDay: 'SUNDAY',
            untilTime: '09:00:00',
          },
          {
            curfewTimesSequence: 7,
            fromDay: 'MONDAY',
            fromTime: '17:00:00',
            untilDay: 'SUNDAY',
            untilTime: '09:00:00',
          },
        ],
      },
    })

    expect($('title').text()).toContain('John Smith')

    expect($('#meeting-details').text()).toContain('The Square')

    expect($('#curfew-address').text()).toContain('addressLineOne')

    expect($('#curfew-times').text()).toContain('05:00 pm')
    expect($('#curfew-times').text()).toContain('on Monday')
    expect($('#curfew-times').text()).toContain('09:00 am')
    expect($('#curfew-times').text()).toContain('on Tuesday')

    // Should be 7 standard, 1 additional and 1 bespoke conditions = 9 in total
    expect($('#ap-conditions > .condition').length).toBe(9)
  })

  describe('Appointment date rendering', () => {
    it('Should render specific date time', () => {
      const $ = render({
        licence: {
          appointmentTimeType: 'SPECIFIC_DATE_TIME',
          appointmentTime: '28/01/2023 10:30',
        } as Licence,
      })
      expect($('[data-qa="appointment-time"]').text().trim()).toBe('On Saturday 28th January 2023 at 10:30 am')
    })
    it('Should render next working day', () => {
      const $ = render({
        licence: {
          appointmentTimeType: 'NEXT_WORKING_DAY_2PM',
          appointmentTime: undefined,
        } as Licence,
      })
      expect($('[data-qa="appointment-time"]').text().trim()).toBe('By 2pm on the next working day after your release')
    })
    it('Should render immediate upon release', () => {
      const $ = render({
        licence: {
          appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
          appointmentTime: undefined,
        } as Licence,
      })
      expect($('[data-qa="appointment-time"]').text().trim()).toBe('Immediately after release')
    })
  })
})
