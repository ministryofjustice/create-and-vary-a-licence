import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import { CaViewCasesTab, LicenceKind } from '../../../enumeration'
import statusConfig from '../../../licences/licenceStatus'

const render = templateRenderer(
  '{% from "partials/hardstop/releasesInTwoWorkingDaysTab.njk" import releasesInTwoWorkingDaysTab %}{{ releasesInTwoWorkingDaysTab(options)}}',
)

describe('Release In Two Working Days template', () => {
  const options = {
    cases: [
      {
        link: '',
        licenceId: 1,
        licenceStatus: 'NOT_STARTED',
        name: 'Bob Smith',
        prisonerNumber: 'A1234AA',
        probationPractitioner: {
          name: 'Other Com',
        },
        releaseDate: '01/05/2022',
        releaseDateLabel: 'Confirmed release date',
        tabType: 'releasesInNextTwoWorkingDays',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        kind: LicenceKind.CRD,
      },
    ],
    tabType: CaViewCasesTab.RELEASES_IN_NEXT_TWO_WORKING_DAYS,
    config: statusConfig,
    count: 1,
    activeTab: 'releases-in-two-working-days',
    timeServedEnabled: true,
  }
  it('should show time-served message when timeServedEnabled is true', () => {
    const $ = render({ options })
    expect($('li').text()).toContain(
      'you can generate a standard licence if a probation practitioner has not submitted one or for time-served releases.',
    )
  })

  it('should show standard message when timeServedEnabled is false', () => {
    const $ = render({ options: { ...options, timeServedEnabled: false } })
    expect($('li').text()).toContain(
      'you can generate a standard licence if a probation practitioner has not submitted one for approval',
    )
  })
})
