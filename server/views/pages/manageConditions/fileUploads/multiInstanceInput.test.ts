import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'
import { MEZ_CONDITION_CODE, RESTRICTION_ZONE_CONDITION_CODE } from '../../../../utils/conditionRoutes'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/manageConditions/fileUploads/multiInstanceInput.njk').toString(),
)

describe('Multi-instance input view', () => {
  describe('Condition header caption', () => {
    it('renders the caption for the MEZ condition', () => {
      const $ = render({
        licence: {
          additionalLicenceConditions: [
            {
              id: 1,
              code: MEZ_CONDITION_CODE,
            },
          ],
        },
        additionalCondition: {
          id: 1,
        },
      })

      expect($('.govuk-caption-l').text().trim()).toBe('Area this person must not enter (exclusion zone)')
    })

    it('renders the caption for the restriction zone condition', () => {
      const $ = render({
        licence: {
          additionalLicenceConditions: [
            {
              id: 1,
              code: RESTRICTION_ZONE_CONDITION_CODE,
            },
          ],
        },
        additionalCondition: {
          id: 1,
        },
      })

      expect($('.govuk-caption-l').text().trim()).toBe('Area this person must not leave (restriction zone)')
    })

    it('does not render the caption for other condition codes', () => {
      const $ = render({
        licence: {
          additionalLicenceConditions: [
            {
              id: 1,
              code: 'OTHER_CODE',
            },
          ],
        },
        additionalCondition: {
          id: 1,
        },
      })

      expect($('.govuk-caption-l').length).toBe(0)
    })
  })
})
