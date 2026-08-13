import * as cheerio from 'cheerio'

import { registerNunjucks } from '../../../utils/nunjucksSetup'

const njkEnv = registerNunjucks()

const renderView = (model: Record<string, unknown>) => {
  const rendered = njkEnv.render('pages/approve/view.njk', model)
  return cheerio.load(rendered)
}

const defaultLicence = {
  id: 1,
  nomsId: 'A1234AA',
  firstName: 'John',
  lastName: 'Smith',
  forename: 'John',
  surname: 'Smith',
  kind: 'CRD',
  typeCode: 'AP',
  statusCode: 'SUBMITTED',
  appointmentTime: '12/12/2022 14:16',
  submittedByFullName: 'Jane Doe',
  comUsername: 'joebloggs',
}

describe('Approve view page', () => {
  describe('isLicenceUnsubmittable toggle', () => {
    it('should show the warning banner when isLicenceUnsubmittable is true', () => {
      const $ = renderView({
        licence: defaultLicence,
        additionalConditions: [],
        staffDetails: null,
        isLicenceUnsubmittable: true,
        csrfToken: 'token',
        returnPath: '/licence/approve/id/1/view',
        dpsUrl: 'http://dps.example.com',
        serviceName: 'test-service',
      })

      expect($('.moj-banner--warning').length).toBe(1)
      expect($('.moj-banner--warning').text()).toContain(
        'This licence cannot be approved until a date and time for the initial appointment have been set. Contact the probation practitioner if they do not get entered soon.',
      )
    })

    it('should not show the warning banner when isLicenceUnsubmittable is false', () => {
      const $ = renderView({
        licence: defaultLicence,
        additionalConditions: [],
        staffDetails: null,
        isLicenceUnsubmittable: false,
        csrfToken: 'token',
        returnPath: '/licence/approve/id/1/view',
        dpsUrl: 'http://dps.example.com',
        serviceName: 'test-service',
      })

      expect($('.moj-banner--warning').length).toBe(0)
    })

    it('approve button should be disabled if the licence is unsubmittable', () => {
      const $ = renderView({
        licence: defaultLicence,
        additionalConditions: [],
        staffDetails: null,
        isLicenceUnsubmittable: true,
        csrfToken: 'token',
        returnPath: '/licence/approve/id/1/view',
        dpsUrl: 'http://dps.example.com',
        serviceName: 'test-service',
      })

      expect($('[data-qa="approve-licence-disabled"]').length).toBe(1)
      expect($('[data-qa="approve-licence-disabled"]').attr('disabled')).toBeDefined()
      expect($('[data-qa="approve-licence"]').length).toBe(0)
    })

    it('approve button should be enabled if the licence is submittable', () => {
      const $ = renderView({
        licence: defaultLicence,
        additionalConditions: [],
        staffDetails: null,
        isLicenceUnsubmittable: false,
        csrfToken: 'token',
        returnPath: '/licence/approve/id/1/view',
        dpsUrl: 'http://dps.example.com',
        serviceName: 'test-service',
      })

      expect($('[data-qa="approve-licence"]').length).toBe(1)
      expect($('[data-qa="approve-licence"]').attr('disabled')).toBeUndefined()
      expect($('[data-qa="approve-licence-disabled"]').length).toBe(0)
    })
  })
})
