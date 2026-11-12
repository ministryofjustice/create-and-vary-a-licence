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

  it.each([
    ['SPECIFIC_DATE_TIME', 'on '],
    ['NEXT_WORKING_DAY_2PM', 'by 2pm on the next working day after you leave prison'],
    ['IMMEDIATE_UPON_RELEASE', 'as soon as you leave prison'],
  ])('renders appointment timing for %s', (appointmentTimeType, expectedText) => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'Forename',
        surname: 'Surname',
        typeCode: 'AP',
        version: '2.0',
        appointmentTimeType,
        appointmentTime: '23/12/2021 11:15',
      },
    })

    expect($('#appointment-time').text()).toContain(expectedText.trim())
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
    } else {
      expect(appointmentContact.hasClass('bold')).toBe(true)
    }
  })
})
