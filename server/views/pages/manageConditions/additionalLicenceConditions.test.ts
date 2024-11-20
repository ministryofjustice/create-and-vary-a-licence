import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/manageConditions/additionalLicenceConditions.njk').toString(),
)

describe('Create a Licence Views - Additional Conditions', () => {
  it('should display a heading for each condition group', () => {
    const $ = render({
      additionalConditions: [
        {
          category: 'Group 1',
          conditions: [],
        },
        {
          category: 'Group 2',
          conditions: [],
        },
      ],
    })

    expect($('.govuk-form-group > fieldset > legend').length).toBe(2)
    expect($('.govuk-form-group:nth-child(1) > fieldset > legend').text().trim()).toBe('Group 1')
    expect($('.govuk-form-group:nth-child(2) > fieldset > legend').text().trim()).toBe('Group 2')
  })

  it('should display a checkbox for each condition in a group', () => {
    const $ = render({
      additionalConditions: [
        {
          category: 'Group 1',
          conditions: [
            {
              code: 'condition1',
              text: 'conditionText1',
            },
            {
              code: 'condition2',
              text: 'conditionText2',
            },
          ],
        },
        {
          category: 'Group 2',
          conditions: [
            {
              code: 'condition3',
              text: 'conditionText3',
            },
          ],
        },
      ],
    })

    expect($('.govuk-form-group:nth-child(1) input').length).toBe(2)
    expect($('.govuk-form-group:nth-child(2) input').length).toBe(1)
  })

  it('should check the checkboxes if they are present on the licence', () => {
    const $ = render({
      licence: {
        additionalLicenceConditions: [
          {
            code: 'condition1',
          },
        ],
      },
      additionalConditions: [
        {
          category: 'Group 1',
          conditions: [
            {
              code: 'condition1',
              text: 'conditionText1',
            },
            {
              code: 'condition2',
              text: 'conditionText2',
            },
          ],
        },
        {
          category: 'Group 2',
          conditions: [
            {
              code: 'condition3',
              text: 'conditionText3',
            },
          ],
        },
      ],
    })

    expect($('.govuk-form-group:nth-child(1) input:nth-child(1)').attr('checked')).toBe('checked')
    expect($('.govuk-form-group:nth-child(1) input:nth-child(2)').attr('checked')).toBeUndefined()
    expect($('.govuk-form-group:nth-child(2) input:nth-child(1)').attr('checked')).toBeUndefined()
  })
})
