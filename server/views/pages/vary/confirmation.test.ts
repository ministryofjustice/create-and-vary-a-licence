import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/confirmation.njk').toString())

describe('Vary confirmation page', () => {
  it('shows feedback links for HDC variations', () => {
    const $ = render({ licence: { kind: 'HDC_VARIATION' } })

    expect($('#improve-service-header').text().trim()).toBe('Help improve this service')
    expect($('#survey-link').attr('href')).toBe('https://www.smartsurvey.co.uk/s/HDC_in_CVL/')
    expect($('#service-now-link').attr('href')).toBe(
      'https://mojprod.service-now.com/moj_sp?id=sc_cat_item&table=sc_cat_item&sys_id=e389e8931b8bc65025dc6351f54bcb82&recordUrl=com.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1&sysparm_id=e389e8931b8bc65025dc6351f54bcb82%20',
    )
  })

  it('does not show feedback links for other variations', () => {
    const $ = render({ licence: { kind: 'VARIATION' } })

    expect($('body').text()).not.toContain('Help improve this service')
  })
})
