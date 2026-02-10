import fs from 'fs'
import { templateRenderer } from '../../../../../utils/__testutils/templateTestUtils'

describe('NDelius record missing', () => {
  const render = templateRenderer(
    fs.readFileSync('server/views/pages/create/prisonCreated/timeServed/ndeliusRecordMissing.njk').toString(),
  )

  it('should show print licence pdf button', () => {
    const $ = render({
      nomisId: 'A1234AA',
      licenceStartDate: '26/03/2028',
      dateOfBirth: '14/07/1963',
      backLink: '/licence/view/cases',
    })

    expect($('.pipe-separated__item').text()).toContain('Prison number: A1234AA')
    expect($('.pipe-separated__item').text()).toContain('Release date: 26 March 2028')
    expect($('.pipe-separated__item').text()).toContain('Date of birth: 14 July 1963')
    expect($('[data-qa="technology-portal-link"]').attr('href')).toContain(
      'https://mojprod.service-now.com/moj_sp?id=sc_cat_item&table=sc_cat_item&sys_id=e389e8931b8bc65025dc6351f54bcb82&recordUrl=com.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1&sysparm_id=e389e8931b8bc65025dc6351f54bcb82%20',
    )
  })
})
