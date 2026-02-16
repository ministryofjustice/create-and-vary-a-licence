import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import LicenceKind from '../../../enumeration/LicenceKind'
import config from '../../../config'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/timeline.njk').toString())

describe('Timeline', () => {
  const existingConfig = config

  beforeEach(() => {
    config.hdcEnabled = true
  })

  afterEach(() => {
    config.hdcEnabled = existingConfig.hdcEnabled
  })

  it('should display the text Last update with the date', () => {
    const $ = render({
      timelineEvents: [
        {
          eventType: 'VARIATION_IN_PROGRESS',
          title: 'Variation in progress',
          statusCode: 'VARIATION_IN_PROGRESS',
          createdBy: 'CVL COM',
          licenceId: 3,
          lastUpdate: '18/07/2022 11:03:07',
        },
      ],
    })
    expect($('.moj-timeline__date').text()).toContain('Last update: ')
  })

  it('should not display the text Last update with the date', () => {
    const $ = render({
      timelineEvents: [
        {
          eventType: 'SUBMITTED',
          title: 'Variation submitted',
          statusCode: 'VARIATION_SUBMITTED',
          createdBy: 'CVL COM',
          licenceId: 3,
          lastUpdate: '18/07/2022 11:03:07',
        },
      ],
    })
    expect($('.moj-timeline__date').text()).not.toContain('Last update: ')
  })
  it('should display correct date description for "vary" routes', () => {
    const $ = render({
      isVaryJourney: true,
      licence: { typeCode: 'AP', licenceExpiryDate: '01/01/2022' },
    })
    expect($('[data-qa=date]').text()).not.toContain('Release date: ')
    expect($('[data-qa=date]').text()).toContain('Licence end date:')
  })

  it('should display the View licence button for HDC licences when hdcEnabled is false', () => {
    config.hdcEnabled = false
    const { hdcEnabled } = config
    const $ = render({
      licence: { kind: LicenceKind.HDC },
      timelineEvents: [],
      callToAction: 'VIEW',
      hdcEnabled,
    })
    expect($('[data-qa=view-licence]').length).toBe(1)
    expect($('[data-qa=view-licence]').text().trim()).toContain('View licence')
  })

  it('should display the How do I vary the licence component for HDC licences when hdcEnabled is false', () => {
    config.hdcEnabled = false
    const { hdcEnabled } = config
    const $ = render({
      licence: { kind: LicenceKind.HDC },
      timelineEvents: [],
      callToAction: 'VIEW',
      hdcEnabled,
    })
    expect($('[data-qa=hdc-vary-licence]').text().trim()).toContain('How do I vary this licence?')
    expect($('[data-qa=hdc-vary-licence]').text().trim()).toContain(
      'Email createandvaryalicence@digital.justice.gov.uk to vary this licence.',
    )
  })

  it('should display the View or vary licence button for HDC licences when hdcEnabled is true', () => {
    const { hdcEnabled } = config
    const $ = render({
      licence: { kind: LicenceKind.HDC },
      timelineEvents: [],
      callToAction: 'VIEW_OR_VARY',
      hdcEnabled,
    })
    expect($('[data-qa=view-or-vary-licence]').length).toBe(1)
    expect($('[data-qa=view-or-vary-licence]').text().trim()).toContain('View or vary licence')
  })

  it('should not display the How do I vary the licence component for HDC licences when hdcEnabled is true', () => {
    const { hdcEnabled } = config
    const $ = render({
      licence: { kind: LicenceKind.HDC },
      timelineEvents: [],
      callToAction: 'VIEW_OR_VARY',
      hdcEnabled,
    })
    expect($('body').text().trim()).not.toContain('How do I vary this licence?')
    expect($('[data-qa=hdc-vary-licence]').text().trim()).not.toContain(
      'Email createandvaryalicence@digital.justice.gov.uk to vary this licence.',
    )
  })
})
