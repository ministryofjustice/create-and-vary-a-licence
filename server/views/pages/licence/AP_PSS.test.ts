import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/licence/AP_PSS.njk').toString())

describe('Print an AP_PSS licence', () => {
  it('verify render of an AP_PSS licence', () => {
    const $ = render({
      licence: {
        id: 1,
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP_PSS',
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
        additionalConditions: [
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
    expect($('#title').text()).toContain('John Smith')

    // Check the offender image is present
    expect($('#offender > #offender-image').length).toBe(1)

    // Check the supervision section is present with 2 bold dates
    expect($('#ap-dates > p > .bold').length).toBe(2)

    // Check the induction appointment is present with 3 paragraphs
    expect($('#induction > #meeting-details > p').length).toBe(3)

    // Check the release to other text is present
    expect($('#cancellation-pss').text()).toContain('Criminal Justice Act 2003')

    expect($('#cancellation-ap').text()).toContain('Criminal Justice Act 2003')

    // Should be 7 standard, 1 additional and 1 bespoke conditions = 9 in total
    expect($('#ap-conditions > .condition').length).toBe(9)

    // Check the cancellation text is present
    expect($('#failure-to-comply-pss').text()).toContain('Criminal Justice Act 2003')

    // Check the recall text is present
    expect($('#recall').text()).toContain('Criminal Justice Act 2003')

    // Check the failure to comply text is present
    expect($('#failure-to-comply-ap').text()).toContain('licence revoked')

    // Check the signature box and content are present
    expect($('.boxed > .signatures > p').length).toBe(6)
  })

  it('Should load Licence Period section if licence is in PSS and isActivatedInPssPeriod is false and not in variation', () => {
    const $ = render({
      licence: {
        isInPssPeriod: true,
        isActivatedInPssPeriod: false,
      },
    })
    expect($('#licence-period').text().trim()).toBe('Licence Period')
  })

  it('Should load Licence Period section if licence is not in PSS and isActivatedInPssPeriod is false and not in variation', () => {
    const $ = render({
      licence: {
        isInPssPeriod: false,
        isActivatedInPssPeriod: false,
      },
    })
    expect($('#licence-period').text().trim()).toBe('Licence Period')
  })

  it('Should load Licence Period section if licence is not in PSS and isActivatedInPssPeriod is false and in variation', () => {
    const $ = render({
      licence: {
        isInPssPeriod: false,
        isActivatedInPssPeriod: false,
        statusCode: 'VARIATION_IN_PROGRESS',
      },
    })
    expect($('#licence-period').text().trim()).toBe('Licence Period')
  })

  it('Should not load Licence Period section if isActivatedInPssPeriod is true', () => {
    const $ = render({
      licence: {
        isActivatedInPssPeriod: true,
      },
    })
    expect($('#licence-period').text().trim()).not.toBe('Licence Period')
  })

  it('Should not load Licence Period section if licence is in PSS period and status varied', () => {
    const $ = render({
      licence: {
        isInPssPeriod: true,
        isActivatedInPssPeriod: false,
        statusCode: 'VARIATION_IN_PROGRESS',
      },
    })
    expect($('#licence-period').text().trim()).not.toBe('Licence Period')
  })

  it('Should not load Licence Period section if licence is in PSS period and status not varied', () => {
    const $ = render({
      licence: {
        isInPssPeriod: true,
        isActivatedInPssPeriod: false,
        statusCode: 'APPROVED',
      },
    })
    expect($('#licence-period').text().trim()).toBe('Licence Period')
  })
})
