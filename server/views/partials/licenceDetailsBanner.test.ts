import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Licence details banner', () => {
  const render = templateRenderer('{% include "partials/licenceDetailsBanner.njk" %}')

  it('should not render anything if licence is not available', () => {
    const $ = render({})

    expect($('body').text().length).toBe(0)
  })

  it('should not render anything if hideLicenceBanner is true', () => {
    const $ = render({
      licence: {
        crn: '123',
        nomsId: 'ABC',
      },
      hideLicenceBanner: true,
      user: {
        authSource: 'delius',
      },
    })

    expect($('body').text().length).toBe(0)
  })

  it('should render CRN instead of nomisId if user is delius user', () => {
    const $ = render({
      licence: {
        crn: '123',
        nomsId: 'ABC',
      },
      user: {
        authSource: 'delius',
      },
    })

    expect($('.pipe-separated__item:first').text()).toBe('CRN: 123')
  })

  it('should render nomisId instead of CRN if user is nomis user', () => {
    const $ = render({
      licence: {
        crn: '123',
        nomsId: 'ABC',
      },
      user: {
        authSource: 'nomis',
      },
    })

    expect($('.pipe-separated__item:first').text()).toBe('Prison number: ABC')
  })
})
