import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import { MEZ_CONDITION_CODE, RESTRICTION_ZONE_CONDITION_CODE } from '../../../../utils/conditionRoutes'

const render = templateRenderer(fs.readFileSync('server/views/pages/manageConditions/fileUploads/list.njk').toString())

describe('File upload list view', () => {
  describe('Condition header caption', () => {
    it('renders the caption for the MEZ condition', () => {
      const $ = render({ conditionId: '123', conditionCode: MEZ_CONDITION_CODE, description: 'Test file' })

      expect($('.govuk-caption-l').text().trim()).toBe('Area this person must not enter (exclusion zone)')
    })

    it('renders the caption for the restriction zone condition', () => {
      const $ = render({ conditionId: '123', conditionCode: RESTRICTION_ZONE_CONDITION_CODE, description: 'Test file' })

      expect($('.govuk-caption-l').text().trim()).toBe('Area this person must not leave (restriction zone)')
    })

    it('does not render the caption for other condition codes', () => {
      const $ = render({ conditionId: '123', conditionCode: 'OTHER_CODE', description: 'Test file' })

      expect($('.govuk-caption-l').length).toBe(0)
    })
  })
})
