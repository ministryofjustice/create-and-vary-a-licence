import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/manageConditions/fileUploads/singleInstanceInput.njk').toString(),
)

const model = {
  applicationName: 'Create and vary a licence',
  licence: { id: 1 },
  additionalCondition: { id: 1 },
  config: {
    code: 'condition-code',
    text: 'Condition text',
  },
  csrfToken: 'csrf-token',
}

describe('Single instance file upload input view', () => {
  it('displays the header caption from the condition config', () => {
    const $ = render({
      ...model,
      config: { ...model.config, headerCaption: 'Event exclusion condition' },
    })

    expect($('.govuk-grid-column-three-quarters > .govuk-caption-l').text().trim()).toBe('Event exclusion condition')
  })

  it('does not display a header caption when one is not configured', () => {
    const $ = render(model)

    expect($('.govuk-grid-column-three-quarters > .govuk-caption-l')).toHaveLength(0)
  })
})
