import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import statusConfig from '../../../licences/licenceStatus'
import { CaViewCasesTab, LicenceKind } from '../../../enumeration'

const render = templateRenderer(fs.readFileSync('server/views/pages/view/cases.njk').toString())

describe('View and print a licence - case list', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('should display a prison view table containing licences to print', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'Confirmed release date',
          tabType: 'releasesInNextTwoWorkingDays',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '01/09/2022',
          releaseDateLabel: 'CRD',
          tabType: 'releasesInNextTwoWorkingDays',
        },
      ],
      showAttentionNeededTab: false,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > div > span').text()).toBe('Test Person')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('Confirmed release date: 3 Aug 2022')
    expect($('#name-2 > div > span').text()).toBe('John Smith')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#release-date-2').text()).toBe('CRD: 1 Sep 2022')
  })

  it('should display a probation view table containing licences to print', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = true
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'Confirmed release date',
          tabType: '',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '01/09/2022',
          releaseDateLabel: 'CRD',
          tabType: '',
        },
      ],
      showAttentionNeededTab: false,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > div > span').text()).toBe('Test Person')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('3 Aug 2022')
    expect($('#name-2 > div > span').text()).toBe('John Smith')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#release-date-2').text()).toBe('1 Sep 2022')
  })

  it('should load people in prison tab with three sub tabs', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'Confirmed release date',
          tabType: 'releasesInNextTwoWorkingDays',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '01/09/2022',
          releaseDateLabel: 'CRD',
          tabType: 'futureReleases',
        },
        {
          name: 'Joe Bloggs',
          prisonerNumber: 'A1234AC',
          releaseDate: '10/09/2022',
          releaseDateLabel: 'CRD',
          tabType: 'attentionNeeded',
        },
        {
          name: 'Joe Bloggs',
          prisonerNumber: 'A1234AC',
          releaseDate: '10/09/2022',
          releaseDateLabel: 'CRD',
          tabType: 'attentionNeeded',
        },
      ],
      showAttentionNeededTab: true,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('.govuk-tabs__list-item--selected').text()).toContain('Releases in next 2 working days')
    expect($('.govuk-tabs__list a').text()).toContain('Releases in next 2 working days')
    expect($('.govuk-tabs__list a').text()).toContain('Future releases')
    expect($('.govuk-tabs__list a').text()).toContain('Attention needed')
    expect($('#attention-needed-count').text()).toEqual('2')
  })

  it('should hide attention needed tab', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'Confirmed release date',
          tabType: 'releasesInNextTwoWorkingDays',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '01/09/2022',
          releaseDateLabel: 'CRD',
          tabType: 'futureReleases',
        },
      ],
      showAttentionNeededTab: false,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('.govuk-tabs__list-item--selected').text()).toContain('Releases in next 2 working days')
    expect($('.govuk-tabs__list a').text()).toContain('Releases in next 2 working days')
    expect($('.govuk-tabs__list a').text()).toContain('Future releases')
    expect($('.govuk-tabs__list a').text()).not.toContain('Attention needed')
  })

  it('should highlight a HDC licence with a HDC release warning label in prison view', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'HDCAD',
          tabType: 'releasesInNextTwoWorkingDays',
          kind: LicenceKind.HDC,
        },
      ],
      showAttentionNeededTab: false,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > div > span').text()).toBe('Test Person')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('HDCAD: 3 Aug 2022HDC release')
  })

  it('should highlight a HDC licence with a HDC release warning label in prison view for the attention needed tab', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'HDCAD',
          tabType: 'releasesInNextTwoWorkingDays',
          kind: LicenceKind.HDC,
        },
      ],
      showAttentionNeededTab: true,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > div > span').text()).toBe('Test Person')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('HDCAD: 3 Aug 2022HDC release')
  })

  it('should highlight a HDC licence with a HDC release warning label in probation view', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = true
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'HDCAD',
          tabType: 'releasesInNextTwoWorkingDays',
          kind: LicenceKind.HDC,
        },
      ],
      showAttentionNeededTab: false,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > div > span').text()).toBe('Test Person')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('HDCAD: 3 Aug 2022HDC release')
  })

  it('should highlight a Time Served licence with a Time Served release warning label and Not allocated yet com in prison view', () => {
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Test Person',
          prisonerNumber: 'A1234AA',
          releaseDate: '03/08/2022',
          releaseDateLabel: 'CRD',
          tabType: 'releasesInNextTwoWorkingDays',
          hardStopKind: LicenceKind.TIME_SERVED,
        },
      ],
      showAttentionNeededTab: false,
      CaViewCasesTab,
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('tbody .govuk-table__row').length).toBe(1)
    expect($('#name-1 > div > span').text()).toBe('Test Person')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('3 Aug 2022Time-served release')
    expect($('#com-1').text()).toBe('Not allocated yet')
  })
})
