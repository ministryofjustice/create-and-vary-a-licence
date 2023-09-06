import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/timeline.njk').toString())

describe('Timeline', () => {
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
})
