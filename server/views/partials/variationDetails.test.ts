import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Variation details', () => {
  const render = templateRenderer(
    '{% from "partials/variationDetails.njk" import variationDetails %}{{ variationDetails(licence, conversation) }}',
  )

  const baseLicence = {
    spoDiscussion: 'Yes',
    vloDiscussion: 'No',
    curfewAddress: {
      accommodationType: 'RESIDENTIAL',
      postReleaseResidentialChecksNotCompletedReason: 'Reason provided',
    },
  }

  it('should not render residential checks section when checksCompleted is null', () => {
    const $ = render({
      licence: {
        ...baseLicence,
        curfewAddress: {
          ...baseLicence.curfewAddress,
          postReleaseResidentialChecksCompleted: null,
        },
      },
      conversation: [],
    })

    expect($('body').text()).not.toContain('Have you completed the residential address checks?')
    expect($('body').text()).not.toContain('Enter a reason why address checks have not been completed')
  })

  it('should render residential checks and reason when checksCompleted is false', () => {
    const $ = render({
      licence: {
        ...baseLicence,
        curfewAddress: {
          ...baseLicence.curfewAddress,
          postReleaseResidentialChecksCompleted: false,
        },
      },
      conversation: [],
    })

    expect($('body').text()).toContain('Have you completed the residential address checks?')
    expect($('body').text()).toContain('No')
    expect($('body').text()).toContain('Enter a reason why address checks have not been completed')
    expect($('body').text()).toContain('Reason provided')
  })

  it('should render residential checks without reason when checksCompleted is true', () => {
    const $ = render({
      licence: {
        ...baseLicence,
        curfewAddress: {
          ...baseLicence.curfewAddress,
          postReleaseResidentialChecksCompleted: true,
        },
      },
      conversation: [],
    })

    expect($('body').text()).toContain('Have you completed the residential address checks?')
    expect($('body').text()).toContain('Yes')
    expect($('body').text()).not.toContain('Enter a reason why address checks have not been completed')
  })
})
