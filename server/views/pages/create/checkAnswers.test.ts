import fs from 'fs'
import { addDays } from 'date-fns'

import { Licence } from '../../../@types/licenceApiClientTypes'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/create/checkAnswers.njk').toString())

describe('Create a Licence Views - Check Answers', () => {
  const licence = {
    id: 1,
    typeCode: 'AP_PSS',
    statusCode: 'IN_PROGRESS',
    appointmentTimeType: 'SPECIFIC_DATE_TIME',
    additionalLicenceConditions: [
      [
        {
          code: 'condition1',
          category: 'Category 1',
          expandedText: 'Template 1',
          uploadSummary: [],
          data: [
            {
              field: 'field1',
              value: 'Data 1',
              contributesToLicence: true,
            },
          ],
        },
      ],
      {
        code: 'condition2',
        category: 'Category 2',
        expandedText: 'Template 2',
        uploadSummary: [],
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
        uploadSummary: [],
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
        uploadSummary: [],
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
            contributesToLicence: true,
          },
        ],
      },
    ],
    bespokeConditions: [{ text: 'Bespoke condition 1' }, { text: 'Bespoke condition 2' }],
    electronicMonitoringProviderStatus: 'NOT_NEEDED',
  } as Licence

  it('should display additional licence conditions section if licence type is AP', () => {
    const $ = render({ licence: { ...licence, typeCode: 'AP' } })
    expect($('#additional-licence-conditions-heading').text()).toBe('Additional licence conditions (0)')
  })

  it('should display additional licence conditions section if licence type is AP_PSS', () => {
    const $ = render({ licence })
    expect($('#additional-licence-conditions-heading').text()).toBe('Additional licence conditions (0)')
  })

  it('should not display additional licence conditions section if licence type is PSS', () => {
    const $ = render({ licence: { ...licence, typeCode: 'PSS' } })
    expect($('#additional-licence-conditions-heading').length).toBe(0)
  })

  it('should display a table containing the additional licence conditions', () => {
    const $ = render({
      licence,
      additionalConditions: [
        [
          {
            code: 'condition1',
            category: 'Category 1',
            expandedText: 'Template 1',
            uploadSummary: [],
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
            uploadSummary: [],
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

    expect($('#additionalLicenceConditions > .govuk-summary-list__row').length).toBe(2)
    expect($('#additional-licence-conditions-heading').text()).toBe('Additional licence conditions (2)')

    // Check actual condition wording - 1st
    expect($('#additionalLicenceConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe(
      'Template 1',
    )
    expect($('#additionalLicenceConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe(
      'Data 1',
    )

    // Check actual condition wording - 2nd
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
  })

  it('should display additional PSS conditions section if licence type is PSS', () => {
    const $ = render({
      licence: { ...licence, typeCode: 'PSS' },
    })
    expect($('#additional-pss-conditions-heading').text()).toBe('Additional post sentence supervision requirements (2)')
  })

  it('should display additional PSS conditions section if licence type is AP_PSS', () => {
    const $ = render({
      licence,
    })
    expect($('#additional-pss-conditions-heading').text()).toBe('Additional post sentence supervision requirements (2)')
  })

  it('should not display additional PSS licence conditions section if licence type is AP', () => {
    const $ = render({ licence: { ...licence, typeCode: 'AP' } })
    expect($('#additional-pss-conditions-heading').length).toBe(0)
  })

  it('should display a table containing the additional PSS conditions', () => {
    const $ = render({
      licence: { ...licence, typeCode: 'PSS' },
    })

    expect($('#additionalPssConditions > .govuk-summary-list__row').length).toBe(2)
    expect($('#additional-pss-conditions-heading').text()).toBe('Additional post sentence supervision requirements (2)')

    expect($('#additionalPssConditions > div:nth-child(1) > dt').text().trim()).toBe('Category 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(1)').text().trim()).toBe('Template 1')
    expect($('#additionalPssConditions > div:nth-child(1) > dd > div:nth-child(2) > span').text().trim()).toBe('Data 1')

    expect($('#additionalPssConditions > div:nth-child(2) > dt').text().trim()).toBe('Category 2')
    expect($('#additionalPssConditions > div:nth-child(2) > dd > div:nth-child(1)').text().trim()).toBe('Template 2')
    expect(
      $('#additionalPssConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(1)').text().trim(),
    ).toBe('Data 2A, Data 2B')
    expect(
      $('#additionalPssConditions > div:nth-child(2) > dd > div:nth-child(2) > span:nth-child(2)').text().trim(),
    ).toBe('Data 2C')
  })

  it('should display a table containing the bespoke conditions for AP licences', () => {
    const $ = render({
      licence: { ...licence, typeCode: 'AP' },
    })

    expect($('#bespoke-conditions-details > .govuk-summary-list__row').length).toBe(2)
    expect($('#bespoke-conditions-heading').text()).toBe('Bespoke licence conditions (2)')

    expect($('#bespoke-conditions-details > div:nth-child(1) > .govuk-summary-list__value').text().trim()).toBe(
      'Bespoke condition 1',
    )
    expect($('#bespoke-conditions-details > div:nth-child(2) > .govuk-summary-list__value').text().trim()).toBe(
      'Bespoke condition 2',
    )
  })

  it('should show change links and submit button when licence status is IN_PROGRESS and canEditInitialAppt is true', () => {
    const $ = render({
      licence,
      additionalConditions: [
        [
          {
            code: 'condition1',
            category: 'Category 1',
            expandedText: 'Template 1',
            uploadSummary: [],
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
            uploadSummary: [],
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
                contributesToLicence: true,
              },
            ],
          },
        ],
      ],
      canEditInitialAppt: true,
      statusCode: 'IN_PROGRESS',
      isInHardStopPeriod: false,
    })

    expect($('.govuk-summary-list__actions').length).toBe(11)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(1)

    const $2 = render({
      licence: { ...licence, appointmentTimeType: 'IMMEDIATE_UPON_RELEASE' },
      additionalConditions: [
        [
          {
            code: 'condition1',
            category: 'Category 1',
            expandedText: 'Template 1',
            uploadSummary: [],
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
            uploadSummary: [],
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
                contributesToLicence: true,
              },
            ],
          },
        ],
      ],
      canEditInitialAppt: true,
      statusCode: 'IN_PROGRESS',
      isInHardStopPeriod: false,
    })

    expect($2('.govuk-summary-list__actions').length).toBe(10)
    expect($2('[data-qa="send-licence-conditions"]').length).toBe(1)
  })

  it('should hide edit initial appointment buttons when canEditInitialAppt is false', () => {
    const $ = render({
      licence: { ...licence, statusCode: 'IN_PROGRESS' },
      additionalConditions: [
        [
          {
            code: 'condition1',
            category: 'Category 1',
            expandedText: 'Template 1',
            uploadSummary: [],
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
            uploadSummary: [],
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
                contributesToLicence: true,
              },
            ],
          },
        ],
      ],
      canEditInitialAppt: false,
      statusCode: licence.statusCode,
      isInHardStopPeriod: false,
    })

    expect($('.govuk-summary-list__actions').length).toBe(6)
  })

  it('should hide edit licence button when status is IN_PROGRESS', () => {
    const $ = render({
      licence,
      statusCode: 'IN_PROGRESS',
    })

    expect($('#edit-licence-button').length).toBe(0)
    expect($('#edit-licence-button-2').length).toBe(0)
  })

  it('should hide edit licence button when status is ACTIVE', () => {
    const $ = render({
      licence,
      statusCode: 'ACTIVE',
    })

    expect($('#edit-licence-button').length).toBe(0)
    expect($('#edit-licence-button-2').length).toBe(0)
  })

  it('should show edit licence button when status is APPROVED', () => {
    const $ = render({
      licence,
      statusCode: 'APPROVED',
      isInHardStopPeriod: false,
    })

    expect($('#edit-licence-button').length).toBe(1)
    expect($('#edit-licence-button-2').length).toBe(1)
  })

  it('should show edit licence button when status is SUBMITTED', () => {
    const $ = render({
      licence,
      statusCode: 'SUBMITTED',
      isInHardStopPeriod: false,
    })

    expect($('#edit-licence-button').length).toBe(1)
    expect($('#edit-licence-button-2').length).toBe(1)
  })

  it('should show print licence button when status is APPROVED', () => {
    const $ = render({
      licence,
      statusCode: 'APPROVED',
    })

    expect($('#print-licence-button').length).toBe(1)
    expect($('#print-licence-button-2').length).toBe(1)
  })

  it('should hide print licence button when status is SUBMITTED', () => {
    const $ = render({
      licence,
      statusCode: 'SUBMITTED',
    })

    expect($('#print-licence-button').length).toBe(0)
    expect($('#print-licence-button-2').length).toBe(0)
  })

  it('should hide change links and submit button when licence status is not IN_PROGRESS', () => {
    const $ = render({
      licence,
      statusCode: 'SUBMITTED',
    })

    expect($('.govuk-summary-list__actions').length).toBe(0)
    expect($('.check-answers-header__change-link').length).toBe(0)
    expect($('[data-qa="send-licence-conditions"]').length).toBe(0)
  })

  it('should display correct date description for "non-vary" routes ', () => {
    const tomorrow = addDays(new Date(), 1)

    const $ = render({
      isVaryJourney: false,
      licence: { typeCode: 'AP', licenceExpiryDate: tomorrow },
    })
    expect($('[data-qa=date]').text()).toContain('Release date')
    expect($('[data-qa=date]').text()).not.toContain('Licence end date')
  })

  it('should hide edit licence button in the hard stop period', () => {
    const $ = render({
      licence,
      statusCode: 'SUBMITTED',
      isInHardStopPeriod: true,
    })

    expect($('#edit-licence-button').length).toBe(0)
    expect($('#edit-licence-button-2').length).toBe(0)
  })

  it('should show a "Return to caselist" button on a submitted licence in the hard stop period', () => {
    const $ = render({
      licence,
      statusCode: 'SUBMITTED',
      isInHardStopPeriod: true,
    })

    expect($('[data-qa=return-to-caselist]').length).toBe(1)
    expect($('[data-qa=return-to-caselist]').length).toBe(1)
  })

  it('should show a "Return to caselist" button on an approved licence in the hard stop period', () => {
    const $ = render({
      licence,
      statusCode: 'APPROVED',
      isInHardStopPeriod: true,
    })

    expect($('[data-qa=return-to-caselist]').length).toBe(1)
    expect($('[data-qa=return-to-caselist]').length).toBe(1)
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
