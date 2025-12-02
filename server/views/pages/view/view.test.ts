import fs from 'fs'

import { Licence } from '../../../@types/licenceApiClientTypes'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/view/view.njk').toString())

describe('View and print - single licence view', () => {
  const licence = {
    id: 1,
    kind: 'CRD',
    statusCode: 'APPROVED',
    typeCode: 'AP_PSS',
    forename: 'John',
    surname: 'Smith',
    appointmentTimeType: 'SPECIFIC_DATE_TIME',
    appointmentPerson: 'Jack Frost',
    appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
    additionalLicenceConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        expandedText: 'Template 1',
        data: [
          {
            field: 'field1',
            value: 'Data 1',
            contributesToLicence: true,
          },
        ],
      },
      {
        code: 'condition2',
        category: 'Category 2',
        expandedText: 'Template 2',
        data: [
          {
            field: 'field2',
            value: 'Data 2A',
            contributesToLicence: true,
          },
          {
            field: 'field2',
            value: 'Data 2B',
            contributesToLicence: true,
          },
          {
            field: 'field3',
            value: 'Data 2C',
            contributesToLicence: false,
          },
        ],
      },
    ],
    additionalPssConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        expandedText: 'Template 1',
        data: [
          {
            field: 'field1',
            value: 'Data 1',
            contributesToLicence: true,
          },
        ],
      },
    ],
    bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
  } as Licence

  it('should display a single licence to print', () => {
    const $ = render({
      licence,
      additionalConditions: [
        [
          {
            code: 'condition1',
            category: 'Category 1',
            expandedText: 'Template 1',
            data: [
              {
                field: 'field1',
                value: 'Data 1',
                contributesToLicence: true,
              },
            ],
          },
        ],
        [
          {
            code: 'condition2',
            category: 'Category 2',
            expandedText: 'Template 2',
            data: [
              {
                field: 'field2',
                value: 'Data 2A',
                contributesToLicence: true,
              },
              {
                field: 'field2',
                value: 'Data 2B',
                contributesToLicence: true,
              },
              {
                field: 'field3',
                value: 'Data 2C',
                contributesToLicence: false,
              },
            ],
          },
        ],
      ],
    })

    // Check the appropriate title is used
    expect($('h1').text()).toContain('Print licence and post sentence supervision order for John Smith')

    // Check the initial meeting details are populated
    expect($('#induction-meeting-details > .govuk-summary-list__row').length).toBe(6)

    // Check the additional conditions count
    expect($('#additionalLicenceConditions > .govuk-summary-list__row').length).toBe(2)

    // Check the actual conditions
    expect($('#additionalLicenceConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 1',
    )
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe(
      'Data 1',
    )

    expect($('#additionalLicenceConditions > div:nth-child(2) > dt').text().trim()).toBe('Category 2')
    expect($('#additionalLicenceConditions > div:nth-child(2) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 2',
    )
    expect(
      $('#additionalLicenceConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(1)').text().trim(),
    ).toBe('Data 2A, Data 2B')

    // Check contributesToLicence filters out false values from rendering
    expect(
      $('#additionalLicenceConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(2)').text().trim(),
    ).not.toBe('Data 2C')

    // Check the additional pss conditions are rendered correctly
    expect($('#additionalPssConditions > .govuk-summary-list__row').length).toBe(1)

    // Check the actual PSS requirement
    expect($('#additionalPssConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe('Template 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe('Data 1')

    // Check the bespoke conditions are rendered correctly using the macro for them
    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(2)

    // Check the actual bespoke conditions
    expect($('#bespoke-conditions-details > div:nth-child(1) > dd').text().trim()).toBe('Bespoke condition 1')
    expect($('#bespoke-conditions-details > div:nth-child(2) > dd').text().trim()).toBe('Bespoke condition 2')

    // Check the existence of the print and return to case list buttons
    expect($('[data-qa="print-licence"]').length).toBe(1)
    expect($('[data-qa="return-to-view-list"]').length).toBe(1)

    const $1 = render({
      ...licence,
      appointmentTimeType: 'NEXT_WORKING_DAY_2PM',
    })
    // Check the initial meeting details are populated
    expect($1('#induction-meeting-details > .govuk-summary-list__row').length).toBe(5)
  })

  it('Print buttons are not visible when licence is not approved or active', () => {
    const $ = render({ licence: { ...licence, statusCode: 'SUBMITTED' } })

    expect($('[data-qa="print-licence"]').length).toBe(0)
  })

  it('Title changes to view when licence is not printable', () => {
    const $ = render({ licence: { ...licence, statusCode: 'SUBMITTED' } })

    expect($('h1').text()).toContain('View licence and post sentence supervision order for John Smith')
  })

  it('Title changes depending on licence type', () => {
    const $ = render({
      licence: { ...licence, statusCode: 'ACTIVE', typeCode: 'PSS' },
    })

    expect($('h1').text()).toContain('Print post sentence supervision order for John Smith')
  })

  it('should render the HDC curfew details if the licence kind is HDC', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC' },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
  })

  it('should render the HDC curfew details if the licence kind is HDC_VARIATION', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC_VARIATION' },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
  })

  it('should render the curfew time summary if all the curfew times are equal', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC' },
      hdcLicenceData: { allCurfewTimesEqual: true },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
    expect($('.all-curfew-times-equal').length).toBe(1)
  })

  it('should render the individual curfew times if any of the curfew times are different', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC' },
      hdcLicenceData: { allCurfewTimesEqual: false },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
    expect($('[data-qa=curfew-times-not-equal]').length).toBe(1)
  })
})

describe('View and print - single standard licence view', () => {
  const licence = {
    id: 1,
    kind: 'HARD_STOP',
    statusCode: 'APPROVED',
    typeCode: 'AP_PSS',
    forename: 'John',
    surname: 'Smith',
    appointmentTimeType: 'SPECIFIC_DATE_TIME',
    appointmentPerson: 'Jack Frost',
    appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
    additionalLicenceConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        expandedText: 'Template 1',
        data: [
          {
            field: 'field1',
            value: 'Data 1',
            contributesToLicence: true,
          },
        ],
      },
      {
        code: 'condition2',
        category: 'Category 2',
        expandedText: 'Template 2',
        data: [
          {
            field: 'field2',
            value: 'Data 2A',
            contributesToLicence: true,
          },
          {
            field: 'field2',
            value: 'Data 2B',
            contributesToLicence: true,
          },
          {
            field: 'field3',
            value: 'Data 2C',
            contributesToLicence: false,
          },
        ],
      },
    ],
    additionalPssConditions: [
      {
        code: 'condition1',
        category: 'Category 1',
        expandedText: 'Template 1',
        data: [
          {
            field: 'field1',
            value: 'Data 1',
            contributesToLicence: true,
          },
        ],
      },
    ],
    bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
  } as Licence

  it('should display a single licence to print', () => {
    const $ = render({
      licence,
      additionalConditions: [
        [
          {
            code: 'condition1',
            category: 'Category 1',
            expandedText: 'Template 1',
            data: [
              {
                field: 'field1',
                value: 'Data 1',
                contributesToLicence: true,
              },
            ],
          },
        ],
        [
          {
            code: 'condition2',
            category: 'Category 2',
            expandedText: 'Template 2',
            data: [
              {
                field: 'field2',
                value: 'Data 2A',
                contributesToLicence: true,
              },
              {
                field: 'field2',
                value: 'Data 2B',
                contributesToLicence: true,
              },
              {
                field: 'field3',
                value: 'Data 2C',
                contributesToLicence: false,
              },
            ],
          },
        ],
      ],
    })

    // Check the appropriate title is used
    expect($('h1').text()).toContain('Print licence and post sentence supervision order for John Smith')

    // Check the initial meeting details are populated
    expect($('#induction-meeting-details > .govuk-summary-list__row').length).toBe(6)

    // Check the additional conditions count
    expect($('#additionalLicenceConditions > .govuk-summary-list__row').length).toBe(0)

    // Check the bespoke conditions count
    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(0)

    // Check the licence conditions title
    expect($('h2').text()).toContain('Licence conditions')

    expect($('p').text()).toContain('By default, the licence will automatically contain the following restrictions:')

    // Check the licence conditions
    expect($('ul.standard-conditions li:nth-child(1)').text().trim()).toBe('standard conditions')
    expect($('ul.standard-conditions li:nth-child(2)').text().trim()).toBe('the following additional condition:')
    expect($('.govuk-inset-text').text().trim()).toBe(
      'Not to approach or communicate with any victims of your offences without the prior approval of your supervising officer.',
    )

    // Check the existence of the print and return to case list buttons
    expect($('[data-qa="print-licence"]').length).toBe(1)
    expect($('[data-qa="return-to-view-list"]').length).toBe(1)

    const $1 = render({
      ...licence,
      appointmentTimeType: 'NEXT_WORKING_DAY_2PM',
    })
    // Check the initial meeting details are populated
    expect($1('#induction-meeting-details > .govuk-summary-list__row').length).toBe(5)
  })

  it('should render standard post sentence supervision text', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'PSS',
      },
    })
    // Check the licence conditions title
    expect($('h2').text()).toContain('Licence conditions')

    expect($('p').text()).toContain(
      'This licence contains standard post sentence supervision requirements only by default.',
    )
  })

  it('Print buttons are not visible when licence is not approved or active', () => {
    const $ = render({ licence: { ...licence, statusCode: 'SUBMITTED' } })

    expect($('[data-qa="print-licence"]').length).toBe(0)
  })

  it('Title changes to view when licence is not printable', () => {
    const $ = render({ licence: { ...licence, statusCode: 'SUBMITTED' } })

    expect($('h1').text()).toContain('View licence and post sentence supervision order for John Smith')
  })

  it('Title changes depending on licence type', () => {
    const $ = render({
      licence: { ...licence, statusCode: 'ACTIVE', typeCode: 'PSS' },
    })

    expect($('h1').text()).toContain('Print post sentence supervision order for John Smith')
  })

  it('Title changes for hard stop in progress licence', () => {
    const $ = render({
      licence: { ...licence, statusCode: 'IN_PROGRESS', typeCode: 'PSS' },
    })

    expect($('h1').text()).toContain('Check licence details')
  })

  it('Title chanegs fot time served in progress licence', () => {
    const $ = render({
      licence: { ...licence, statusCode: 'IN_PROGRESS', kind: 'TIME_SERVED', typeCode: 'PSS' },
    })

    expect($('h1').text()).toContain('Check licence details')
  })
})
