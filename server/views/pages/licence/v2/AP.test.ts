import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/licence/v2/AP.njk').toString())

describe('Print a V2 AP licence', () => {
  it('should render the v2 AP template', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
    })
    expect($('html').length).toBe(1)
  })

  it('renders the licence title and prison subtitle', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        kind: 'AP',
        prisonDescription: 'HMP Prison',
      },
      licenceTemplateV2Enabled: true,
    })

    expect($('#title').text()).toBe('Licence for Forename Surname')
    expect($('#subtitle').text()).toBe('Released from HMP Prison')
  })

  it('renders the first-meeting heading', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
    })

    const heading = $('#section-heading-first-meeting')
    expect(heading).toHaveLength(1)
    expect(heading.text()).toContain('Your first probation meeting')
  })

  it('renders meeting content and phone numbers', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        appointmentTelephoneNumber: '01234 567890',
        appointmentAlternativeTelephoneNumber: '09876 543210',
      },
    })

    const content = $('#first-probation-meeting-content')
    expect(content).toHaveLength(1)

    const phoneParagraph = $('#appointment-telephone-details')
    expect(phoneParagraph.text()).toContain('Phone number:')
    expect(phoneParagraph.text()).toContain('Alternative phone number:')
    expect($('#appointment-phone-number').text()).toBe('01234 567890')
    expect($('#appointment-phone-number').hasClass('bold')).toBe(true)

    expect($('#appointment-alternative-phone')).toHaveLength(1)
    expect($('#appointment-alternative-phone-number').text()).toBe('09876 543210')
    expect($('#appointment-alternative-phone-number').hasClass('bold')).toBe(true)
  })

  it('renders duty officer explanation only when appointment is with duty officer', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        appointmentPersonType: 'DUTY_OFFICER',
      },
    })

    const dutyOfficerContent = $('#first-meeting-duty-officer-content')
    expect(dutyOfficerContent.text()).toContain(
      'The duty officer helps people when their supervising officer is unavailable',
    )
  })

  it('does not render duty officer explanation when appointment is not with duty officer', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        appointmentPersonType: 'RESPONSIBLE_COM',
        responsibleComFullName: 'Allocated COM',
      },
    })

    const dutyOfficerContent = $('#first-meeting-duty-officer-content')
    expect(dutyOfficerContent).toHaveLength(0)
  })

  it.each([
    ['SPECIFIC_DATE_TIME', 'on ', '23/12/2021 11:15', '11:15 am'],
    ['SPECIFIC_DATE_TIME', 'on ', '23/12/2021 11:00', '11 am'],
    ['SPECIFIC_DATE_TIME', 'on ', '23/12/2021 09:15', '9:15 am'],
    ['SPECIFIC_DATE_TIME', 'on ', '23/12/2021 21:00', '9 pm'],
    ['NEXT_WORKING_DAY_2PM', 'by 2pm on the next working day after you leave prison', undefined, undefined],
    ['IMMEDIATE_UPON_RELEASE', 'as soon as you leave prison', undefined, undefined],
  ])('renders appointment timing for %s', (appointmentTimeType, expectedText, appointmentTime, expectedTime) => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        appointmentTimeType,
        appointmentTime,
      },
    })

    expect($('#appointment-time').text()).toContain(expectedText.trim())

    if (appointmentTime) {
      const appointmentTimeElement = $('#appointment-time')
      expect(appointmentTimeElement.text()).toContain(expectedTime)
      const boldText = appointmentTimeElement.find('.bold').text()
      expect(boldText).toContain('at')
      expect(boldText).toContain(expectedTime)
    }
  })

  it('renders appointment address correctly', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        licenceAppointmentAddress: {
          firstLine: '12 example ROAD',
          secondLine: 'gENERIC rOW',
          townOrCity: 'generic TOWN',
          county: 'SAMPLE COUNTY',
          postcode: 'AB1 2CD',
        },
      },
    })

    const renderedLines = $('#appointment-address .line-space-after')
      .map((_, line) => $(line).text())
      .get()
    expect(renderedLines).toEqual(['12 Example Road,', 'Generic Row,', 'Generic Town,', 'Sample County,', 'AB1 2CD'])
  })

  it.each([
    ['RESPONSIBLE_COM', 'Allocated COM', 'Allocated COM'],
    ['SPECIFIC_PERSON', 'Entered name', 'Entered name'],
    ['DUTY_OFFICER', undefined, 'the duty officer'],
  ])('renders the correct appointment contact for %s', (appointmentPersonType, appointmentPerson, expectedName) => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        appointmentPersonType,
        appointmentPerson,
        responsibleComFullName: 'Allocated COM',
      },
    })

    expect($('#first-meeting-person-details p').text()).toContain('ask to speak to')
    const appointmentContact = $('#appointment-contact')
    expect(appointmentContact).toHaveLength(1)
    expect(appointmentContact.text()).toContain(expectedName)
    if (appointmentPersonType === 'RESPONSIBLE_COM') {
      expect(appointmentContact.hasClass('bold')).toBe(false)
      expect(appointmentContact.find('.bold').text()).toBe(expectedName)
      expect(appointmentContact.text()).toContain('who will be your supervising officer:')
    } else if (appointmentPersonType === 'DUTY_OFFICER') {
      expect(appointmentContact.hasClass('bold')).toBe(false)
      expect(appointmentContact.find('.bold').text()).toBe('duty officer')
      expect(appointmentContact.text()).toContain('the duty officer:')
    } else {
      expect(appointmentContact.hasClass('bold')).toBe(false)
      expect(appointmentContact.find('.bold').text()).toBe(expectedName)
      expect(appointmentContact.text()).toContain(`${expectedName}:`)
    }
  })

  it('renders the licence condition paragraph', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
    })

    const heading = $('#section-heading-licence-conditions')
    expect(heading).toHaveLength(1)
    expect(heading.text()).toContain('Your licence conditions')

    const paragraphs = $('#licence-conditions-explanation').text().replace(/\s+/g, ' ').trim()
    expect(paragraphs).toContain('What are licence conditions?')
    expect(paragraphs).toContain('Licence conditions tell you what you must and must not do while on licence.')
    expect(paragraphs).toContain('Your supervising officer can change some of these conditions.')
    expect(paragraphs).toContain('Any changes will be explained to you.')
    expect(paragraphs).toContain(
      'Some conditions can be made less strict or removed if you are doing well. If you do not follow your licence conditions, conditions can be added or made stricter.',
    )
    expect(paragraphs).toContain('Read the conditions starting on the next page carefully.')
    expect(paragraphs).toContain('Ask your supervising officer any questions you have.')
  })

  it('renders the recall paragraph', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
    })

    const paragraphs = $('#licence-conditions-recall').text().replace(/\s+/g, ' ').trim()
    expect(paragraphs).toContain('Recall to prison')
    expect(paragraphs).toContain(
      'If you do not follow your licence conditions, your supervising officer will need to consider whether you should be sent back to prison. This is called being recalled.',
    )
    expect(paragraphs).toContain('You may commit an offence called being unlawfully at large if:')
    expect(paragraphs).toContain('a decision is made to recall you to prison and you do not return, or')
    expect(paragraphs).toContain(
      'you remain out of contact with your supervising officer for 6 months after that decision is made',
    )
    expect(paragraphs).toContain('This can result in a fine, a prison sentence of up to 2 years, or both.')
  })

  it('renders the drug testing paragraph', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
    })

    const paragraphs = $('#licence-conditions-drug-testing').text().replace(/\s+/g, ' ').trim()
    expect(paragraphs).toContain('Drug testing')
    expect(paragraphs).toContain('If asked, you must have a drug test, whether or not you have previously used drugs.')
    expect(paragraphs).toContain('You must not do anything to stop or interfere with this test.')
  })

  it('renders the standard conditions page', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        standardLicenceConditions: [
          {
            id: 1,
            sequence: 0,
            text: 'Standard condition 1.',
          },
          {
            id: 2,
            sequence: 1,
            text: 'Standard condition 2.',
          },
          {
            id: 3,
            sequence: 2,
            text: 'Standard condition 3.',
          },
          {
            id: 4,
            sequence: 3,
            text: 'Standard condition 4.',
          },
          {
            id: 5,
            sequence: 4,
            text: 'Standard condition 5.',
          },
        ],
      },
    })

    const heading = $('#section-heading-standard-conditions')
    expect(heading).toHaveLength(1)
    expect(heading.text()).toContain('Standard conditions')

    const explan = $('#standard-conditions-explanation')
    expect(explan).toHaveLength(1)
    expect(explan.text()).toContain('Conditions everyone on licence must follow.')

    expect($('#condition-1').text()).toContain('Standard condition 1.')
    expect($('#condition-2').text()).toContain('Standard condition 2.')
    expect($('#condition-3').text()).toContain('Standard condition 3.')
    expect($('#condition-4').text()).toContain('Standard condition 4.')
    expect($('#condition-5').text()).toContain('Standard condition 5.')

    expect($('#condition-divider-1')).toHaveLength(1)
    expect($('#condition-divider-2')).toHaveLength(1)
    expect($('#condition-divider-3')).toHaveLength(1)
    expect($('#condition-divider-4')).toHaveLength(1)
    // There should be no divider after the last condition, so check that it is not present
    expect($('#condition-divider-5')).toHaveLength(0)
  })

  it('renders additional conditions in a table with the correct heading', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        standardLicenceConditions: [],
        bespokeConditions: [{ text: 'Bespoke condition 1.' }],
      },
      singleItemConditions: [{ text: 'Additional condition 1.' }, { text: 'Additional condition 2.' }],
      multipleItemConditions: [
        [
          { text: 'Additional condition 3.', textPlural: 'Plural form Additional condition 3.' },
          { text: 'Additional condition 3.', textPlural: 'Plural form Additional condition 3.' },
        ],
        [{ text: 'Additional condition 4.' }],
      ],
    })

    expect($('#section-heading-additional-conditions').text().trim()).toBe('Additional and bespoke conditions')
    expect($('.additional-conditions-table thead .additional-conditions__continued-heading').text().trim()).toBe(
      'Additional and bespoke conditions - continued',
    )
    expect($('.additional-conditions-table .additional-conditions__row')).toHaveLength(5)
    expect($('#additional-condition-1').text()).toContain('Additional condition 1.')
    expect($('#additional-condition-2').text()).toContain('Additional condition 2.')
    expect($('#additional-condition-multi-item-1').text()).toContain('Plural form Additional condition 3.')
    expect($('#additional-condition-multi-item-2').text()).toContain('Additional condition 4.')
    expect($('#additional-condition-bespoke-1').text()).toContain('Bespoke condition 1.')
  })

  it('renders the exclusion and event exclusion zones in the right order', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
      exclusionZoneMapData: [{ description: 'Description of exclusion zone 1', isEvent: false }],
      eventExclusionZoneMapData: [
        { description: 'Description of the event exclusion zone', isEvent: true, eventName: 'The event' },
      ],
    })

    expect($('#exclusion-zones-page-break-first-1')).toHaveLength(1)
    expect($('#exclusion-zone-heading-1').text().replace(/\s+/g, ' ').trim()).toContain('Exclusion zone 1')
    expect($('#exclusion-zone-bold-1').text().replace(/\s+/g, ' ').trim()).toContain('Area you must not enter')
    expect($('#exclusion-zone-text-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Do not enter the highlighted area shown in the following map without the prior approval of your supervising officer.',
    )
    expect($('#exclusion-zone-next-page-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Find more information about this map on the next page.',
    )
    expect($('#exclusion-zones-page-break-second-1')).toHaveLength(1)
    expect($('#exclusion-zone-heading-description-1').text().replace(/\s+/g, ' ').trim()).toContain('Exclusion zone 1')
    expect($('#exclusion-zone-bold-description-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Area you must not enter',
    )
    expect($('#exclusion-zone-description-1 p.bold').text().replace(/\s+/g, ' ').trim()).toContain(
      'Description of the area shown in the map on the previous page',
    )
    expect($('#exclusion-zone-description-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Description of exclusion zone 1',
    )

    expect($('#exclusion-zones-page-break-first-2')).toHaveLength(1)
    expect($('#exclusion-zone-heading-2').text().replace(/\s+/g, ' ').trim()).toContain('Exclusion zone 2')
    expect($('#exclusion-zone-bold-2').text().replace(/\s+/g, ' ').trim()).toContain(
      'Area you must not enter during an event',
    )
    expect($('#exclusion-zone-text-2').text().replace(/\s+/g, ' ').trim()).toContain(
      'Do not enter the highlighted area shown in the following map during The event, without the prior approval of your supervising officer.',
    )
    expect($('#exclusion-zone-next-page-2').text().replace(/\s+/g, ' ').trim()).toContain(
      'Find more information about this map on the next page.',
    )
    expect($('#exclusion-zones-page-break-second-2')).toHaveLength(1)
    expect($('#exclusion-zone-heading-description-2').text().replace(/\s+/g, ' ').trim()).toContain('Exclusion zone 2')
    expect($('#exclusion-zone-bold-description-2').text().replace(/\s+/g, ' ').trim()).toContain(
      'Area you must not enter during an event',
    )
    expect($('#exclusion-zone-description-2 p.bold').text().replace(/\s+/g, ' ').trim()).toContain(
      'Description of the area shown in the map on the previous page',
    )
    expect($('#exclusion-zone-description-2').text().replace(/\s+/g, ' ').trim()).toContain(
      'Description of the event exclusion zone',
    )
    expect($('#exclusion-zone-event-name-2 p.bold').text().replace(/\s+/g, ' ').trim()).toContain('Event name')
    expect($('#exclusion-zone-event-name-2').text().replace(/\s+/g, ' ').trim()).toContain('The event')
  })

  it('renders the exclusion without a description page if there is no description', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
      exclusionZoneMapData: [{ isEvent: false }],
    })

    expect($('#exclusion-zones-page-break-first-1')).toHaveLength(1)
    expect($('#exclusion-zone-heading-1').text().replace(/\s+/g, ' ').trim()).toContain('Exclusion zone 1')
    expect($('#exclusion-zone-bold-1').text().replace(/\s+/g, ' ').trim()).toContain('Area you must not enter')
    expect($('#exclusion-zone-text-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Do not enter the highlighted area shown in the following map without the prior approval of your supervising officer.',
    )
    // "Find more information about this map on the next page" and none of the second page
    // should be rendered if there is no description
    expect($('#exclusion-zone-next-page-1')).toHaveLength(0)
    expect($('#exclusion-zones-page-break-second-1')).toHaveLength(0)
    expect($('#exclusion-zone-heading-description-1')).toHaveLength(0)
    expect($('#exclusion-zone-bold-description-1')).toHaveLength(0)
    expect($('#exclusion-zone-description-1 p.bold')).toHaveLength(0)
    expect($('#exclusion-zone-description-1')).toHaveLength(0)
  })

  it('renders the restriction zones in correctly', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
      },
      restrictionZoneMapData: [
        { description: 'Description of restriction zone 1', isEvent: false },
        { isEvent: false },
      ],
    })

    expect($('#restriction-zones-page-break-first-1')).toHaveLength(1)
    expect($('#restriction-zone-heading-1').text().replace(/\s+/g, ' ').trim()).toContain('Restriction zone 1')
    expect($('#restriction-zone-bold-1').text().replace(/\s+/g, ' ').trim()).toContain('Area you must not leave')
    expect($('#restriction-zone-text-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Do not leave the highlighted area shown in the following map without the prior approval of your supervising officer.',
    )
    expect($('#restriction-zone-next-page-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Find more information about this map on the next page.',
    )
    expect($('#restriction-zones-page-break-second-1')).toHaveLength(1)
    expect($('#restriction-zone-heading-description-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Restriction zone 1',
    )
    expect($('#restriction-zone-bold-description-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Area you must not leave',
    )
    expect($('#restriction-zone-description-1 p.bold').text().replace(/\s+/g, ' ').trim()).toContain(
      'Description of the area shown in the map on the previous page',
    )
    expect($('#restriction-zone-description-1').text().replace(/\s+/g, ' ').trim()).toContain(
      'Description of restriction zone 1',
    )

    expect($('#restriction-zones-page-break-first-2')).toHaveLength(1)
    expect($('#restriction-zone-heading-2').text().replace(/\s+/g, ' ').trim()).toContain('Restriction zone 2')
    expect($('#restriction-zone-bold-2').text().replace(/\s+/g, ' ').trim()).toContain('Area you must not leave')
    expect($('#restriction-zone-text-2').text().replace(/\s+/g, ' ').trim()).toContain(
      'Do not leave the highlighted area shown in the following map without the prior approval of your supervising officer.',
    )
    expect($('#restriction-zone-next-page-2')).toHaveLength(0)
    expect($('#restriction-zones-page-break-second-2')).toHaveLength(0)
    expect($('#restriction-zone-heading-description-2')).toHaveLength(0)
    expect($('#restriction-zone-bold-description-2')).toHaveLength(0)
    expect($('#restriction-zone-description-2 p.bold')).toHaveLength(0)
    expect($('#restriction-zone-description-2')).toHaveLength(0)
  })
})
