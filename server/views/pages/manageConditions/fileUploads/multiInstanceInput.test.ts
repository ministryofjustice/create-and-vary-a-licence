import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/manageConditions/fileUploads/multiInstanceInput.njk').toString(),
)

describe('Multi-instance input view', () => {
  describe('Condition header caption', () => {
    it('renders the caption when one is provided', () => {
      const $ = render({
        additionalCondition: {
          id: 1,
          headerCaption: 'Area this person must not enter (exclusion zone)',
        },
      })

      expect($('.govuk-caption-l').text().trim()).toBe('Area this person must not enter (exclusion zone)')
    })

    it('does not render the caption when one is not provided', () => {
      const $ = render({
        additionalCondition: {
          id: 1,
          headerCaption: null,
        },
      })

      expect($('.govuk-caption-l').length).toBe(0)
    })
  })
})
