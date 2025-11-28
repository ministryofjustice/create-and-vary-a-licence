import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/confirmation.njk').toString())

describe('Vary confirmation page', () => {
  it('should show show feedback survey link when kind is time served', () => {
    const $ = render({
      isTimeServedVariation: true,
    })
    expect($('#message').text().trim().toString()).toContain(
      'We have sent the variation request to the head of the Probation Delivery Unit (PDU) for approval.',
    )

    expect($('#improve-service-header').text().toString()).toContain('Help improve this service')

    expect($('#survey-link').attr('href')).toBe('https://www.smartsurvey.co.uk/s/B35S18')
    expect($('#service-now-link').attr('href')).toBe(
      'https://mojprod.service-now.com/moj_sp?id=sc_cat_item&table=sc_cat_item&sys_id=e389e8931b8bc65025dc6351f54bcb82&recordUrl=com.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1&sysparm_id=e389e8931b8bc65025dc6351f54bcb82',
    )
  })

  it('should not show feedback survey link when kind is not time served', () => {
    const $ = render({
      isTimeServedVariation: false,
    })
    expect($('#message').text().trim().toString()).toContain(
      'We have sent the variation request to the head of the Probation Delivery Unit (PDU) for approval.',
    )
    expect($('body').text()).not.toContain('Help improve this service')
  })
})
