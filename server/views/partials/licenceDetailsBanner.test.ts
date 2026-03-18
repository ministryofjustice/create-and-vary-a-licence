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

  it('should render hdcad instead of release date if hdc licence', () => {
    const $ = render({
      licence: {
        kind: 'HDC',
        homeDetentionCurfewActualDate: '01-05-2022',
        homeDetentionCurfewEligibilityDate: '02-05-2022',
      },
    })

    expect($('[data-qa="date"]').text()).toContain('HDC actual date: 1 May 2022')
  })

  it('should render hdced instead of release date if hdc licence and hdcad not present', () => {
    const $ = render({
      licence: {
        kind: 'HDC',
        homeDetentionCurfewEligibilityDate: '02-05-2022',
      },
    })

    expect($('[data-qa="date"]').text()).toContain('HDC eligibility date: 2 May 2022')
  })
})
