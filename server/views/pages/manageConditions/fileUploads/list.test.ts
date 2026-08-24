import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/manageConditions/fileUploads/list.njk').toString())

describe('File upload list view', () => {
  describe('Condition header caption', () => {
    it('renders the caption passed in the conditions array', () => {
      const $ = render({
        conditions: [
          {
            headerCaption: 'Area this person must not enter (exclusion zone)',
          },
        ],
        licenceId: 1,
      })

      expect($('.govuk-caption-l').text().trim()).toBe('Area this person must not enter (exclusion zone)')
    })

    it('does not render the caption if one is not provided', () => {
      const $ = render({
        conditions: [
          {
            headerCaption: null,
          },
        ],
        licenceId: 1,
      })

      expect($('.govuk-caption-l').length).toBe(0)
    })
  })
})
