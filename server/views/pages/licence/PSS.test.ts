import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import type { Licence } from '../../../@types/licenceApiClientTypes'

const render = templateRenderer(fs.readFileSync('server/views/pages/licence/PSS.njk').toString())

describe('Print a PSS licence', () => {
  it('verify render of an PSS licence', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'John',
        surname: 'Smith',
        typeCode: 'PSS' as const,
        version: '1.0',
        prisonCode: 'MDI',
        appointmentPerson: 'Jack Frost',
        appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
        comTelephone: '07878 234566',
        standardPssConditions: [
          { code: '1', text: 'Standard 1' },
          { code: '2', text: 'Standard 2' },
          { code: '3', text: 'Standard 3' },
          { code: '4', text: 'Standard 4' },
          { code: '5', text: 'Standard 5' },
          { code: '6', text: 'Standard 6' },
          { code: '7', text: 'Standard 7' },
        ],
        additionalPssConditions: [
          {
            expandedText:
              'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your drug and alcohold problems.',
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
    })

    // Check the page title contains the offender name
    expect($('title').text()).toContain('John Smith')

    // Check the licence header title contains the offender name
    expect($('.title').text()).toContain('John Smith')

    // Check the offender image is present
    expect($('.offender > #offender-image').length).toBe(1)

    // Check the induction appointment is present with 3 paragraphs
    expect($('#induction > #meeting-details > p').length).toBe(3)

    // Check the release to other text is present
    expect($('#cancellation').text()).toContain('Criminal Justice Act 2003')

    // Should be 7 standard and 1 additional = 8 in total
    expect($('#pss-conditions > .condition').length).toBe(8)

    // Check the cancellation text is present
    expect($('[data-qa="failure-to-comply"]').text()).toContain('If you fail to comply with any requirement')

    // Check the signature box and content are present
    expect($('.boxed > .signatures > p').length).toBe(6)
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

  describe('Appointment person rendering', () => {
    it('should render Duty officer', () => {
      const $ = render({
        licence: {
          appointmentPersonType: 'DUTY_OFFICER',
        },
      })
      expect($('[data-qa="appointment-person"]').text().trim()).toBe('Duty officer')
    })

    it('should render Responsible Com', () => {
      const $ = render({
        licence: {
          appointmentPersonType: 'RESPONSIBLE_COM',
          responsibleComFullName: 'test user1',
        },
      })
      expect($('[data-qa="appointment-person"]').text().trim()).toBe('test user1')
    })

    it('should render someone at an approved premises or a different probation practitioner', () => {
      const $ = render({
        licence: {
          appointmentPersonType: 'SPECIFIC_PERSON',
          appointmentPerson: 'test user2',
        },
      })
      expect($('[data-qa="appointment-person"]').text().trim()).toBe('test user2')
    })
  })
})
