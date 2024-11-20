import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  '{% from "pages/approverImmediateReleaseConditions.njk" import approverImmediateReleaseConditions %}{{ approverImmediateReleaseConditions(options)}}',
)

describe('Caseload', () => {
  it('should display standard conditions text', () => {
    const $ = render({
      options: {
        submittedByFullName: 'Bob Smith',
        prison: 'prison',
        typeCode: 'AP',
      },
    })
    expect($('.licence-conditions').text().toString()).toContain('standard conditions')
    expect($('p').text().toString()).toContain('No other additional or bespoke licence conditions can be added.')
  })

  it('should display post sentence supervision text', () => {
    const $ = render({
      options: {
        submittedByFullName: 'Bob Smith',
        prison: 'prison',
        typeCode: 'PSS',
      },
    })
    expect($('.licence-conditions').text().toString()).toContain(
      'This licence contains standard post sentence supervision requirements only by default.',
    )
    expect($('p').text().toString()).not.toContain('No other additional or bespoke licence conditions can be added.')
  })
})
