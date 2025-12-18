import { templateRenderer } from '../../utils/__testutils/templateTestUtils'
import { CaViewCasesTab, LicenceKind } from '../../enumeration'
import statusConfig from '../../licences/licenceStatus'

interface ProbationPractitioner {
  name: string
  staffCode: string
}

describe('viewCases template', () => {
  it('should render HDC release date message, and formatted date when HDC kind', () => {
    // Given
    const options = createComponentModel({ kind: LicenceKind.HDC })

    // When
    const $ = render({ options })

    // Then
    const releaseDateHtml = $('#release-date-1').html() ?? ''
    expect(releaseDateHtml).toContain('HDC release')
    expect(releaseDateHtml).toContain('Confirmed release date')
    expect(releaseDateHtml).toContain('1 May 2022')
  })

  it('should render time-served release date with message, and formatted date when kind Time Served kind', () => {
    // Given
    const options = createComponentModel({
      kind: LicenceKind.TIME_SERVED,
    })

    // When
    const $ = render({ options })

    // Then
    const releaseDateHtml = $('#release-date-1').html() ?? ''
    expect(releaseDateHtml).toContain('Time-served release')
    expect(releaseDateHtml).toContain('Confirmed release date')
    expect(releaseDateHtml).toContain('1 May 2022')
  })

  it('should render standard release date and messaging when CRD', () => {
    // Given
    const options = createComponentModel({ kind: LicenceKind.CRD })

    // When
    const $ = render({ options })

    // Then
    const releaseDateHtml = $('#release-date-1').html() ?? ''
    expect(releaseDateHtml).toContain('Confirmed release date')
    expect(releaseDateHtml).toContain('1 May 2022')
  })

  it('should render a COM link when staff code and name are present', () => {
    // Given
    const options = createComponentModel({
      kind: LicenceKind.CRD,
      probationPractitioner: { name: 'Jane COM', staffCode: 'JCOM1', allocated: true } as ProbationPractitioner,
    })

    // When
    const $ = render({ options })

    // Then
    const comHtml = $('#com-1').html() ?? ''
    expect(comHtml).toContain('Jane COM')
    expect(comHtml).toContain('/licence/view/probation-practitioner/staffCode/JCOM1')
    expect(comHtml).toContain('activeTab=releases-in-two-working-days')
  })

  it('should show "Not allocated yet" for time-served cases with no COM', () => {
    // Given
    const options = createComponentModel({
      kind: LicenceKind.TIME_SERVED,
      probationPractitioner: null,
    })

    // When
    const $ = render({ options })

    // Then
    expect($('#com-1').text()).toContain('Not allocated yet')
  })

  it('should show "Unallocated" for non-time-served cases with no COM', () => {
    // Given
    const options = createComponentModel({
      kind: LicenceKind.CRD,
      probationPractitioner: null,
    })

    // When
    const $ = render({ options })

    // Then
    expect($('#com-1').text()).toContain('Unallocated')
  })

  const render = templateRenderer(`{% from "partials/viewCases.njk" import viewCases %}{{ viewCases(options) }}`)

  const createComponentModel = ({
    kind,
    name = 'Test Person',
    prisonerNumber = 'A1234AA',
    probationPractitioner = { name: 'Test COM', staffCode: 'T123', allocated: true } as ProbationPractitioner,
  }: {
    kind: LicenceKind
    name?: string
    prisonerNumber?: string
    probationPractitioner?: ProbationPractitioner
  }) => ({
    cases: [
      {
        link: '',
        licenceId: 1,
        licenceStatus: 'NOT_STARTED',
        name,
        prisonerNumber,
        probationPractitioner,
        releaseDate: '01/05/2022',
        releaseDateLabel: 'Confirmed release date',
        tabType: CaViewCasesTab.RELEASES_IN_NEXT_TWO_WORKING_DAYS,
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Updater Name',
        kind,
      },
    ],
    tabType: CaViewCasesTab.RELEASES_IN_NEXT_TWO_WORKING_DAYS,
    activeTab: 'releases-in-two-working-days',
    hasSelectedMultiplePrisonCaseloads: false,
    isSearchPageView: false,
    config: statusConfig,
  })
})
