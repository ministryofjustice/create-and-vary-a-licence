import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import statusConfig from '../../../licences/licenceStatus'
import config from '../../../config'

const render = templateRenderer(fs.readFileSync('server/views/pages/view/cases.njk').toString())
const existingConfig = config

describe('View and print a licence - case list', () => {
  afterEach(() => {
    jest.resetAllMocks()
    config.hardStopEnabled = existingConfig.hardStopEnabled
  })
  it('should display a table containing licences to print', () => {
    const $ = render({
      cases: [
        {
          name: 'Adam Balasaravika',
          prisonerNumber: 'A1234AA',
          releaseDate: '3 Aug 2022',
          releaseDateLabel: 'Confirmed release date',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '1 Sep 2022',
          releaseDateLabel: 'CRD',
        },
      ],
    })
    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > div > span').text()).toBe('Adam Balasaravika')
    expect($('#nomis-id-1').text()).toBe('A1234AA')
    expect($('#release-date-1').text()).toBe('Confirmed release date: 3 Aug 2022')
    expect($('#name-2 > div > span').text()).toBe('John Smith')
    expect($('#nomis-id-2').text()).toBe('A1234AB')
    expect($('#release-date-2').text()).toBe('CRD: 1 Sep 2022')
  })

  it('should load pepople in prison tab with three sub tabs', () => {
    config.hardStopEnabled = true
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Adam Balasaravika',
          prisonerNumber: 'A1234AA',
          releaseDate: '3 Aug 2022',
          releaseDateLabel: 'Confirmed release date',
          tabType: 'releasesInNextTwoWorkingDays',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '1 Sep 2022',
          releaseDateLabel: 'CRD',
          tabType: 'futureReleases',
        },
        {
          name: 'John Deer',
          prisonerNumber: 'A1234AC',
          releaseDate: '10 Sep 2022',
          releaseDateLabel: 'CRD',
          tabType: 'attentionNeeded',
        },
        {
          name: 'John Deer',
          prisonerNumber: 'A1234AC',
          releaseDate: '10 Sep 2022',
          releaseDateLabel: 'CRD',
          tabType: 'attentionNeeded',
        },
      ],
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('input[id="activeTab"]').val()).toBe('releases-in-two-working-days')
    expect($('.govuk-tabs__list a').text()).toContain('Releases in next 2 working days')
    expect($('.govuk-tabs__list a').text()).toContain('Future releases')
    expect($('.govuk-tabs__list a').text()).toContain('Attention needed')
    expect($('#attention-needed-count').text()).toEqual('2')
  })

  it('should hide attention needed tab', () => {
    config.hardStopEnabled = true
    const search = ''
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'Adam Balasaravika',
          prisonerNumber: 'A1234AA',
          releaseDate: '3 Aug 2022',
          releaseDateLabel: 'Confirmed release date',
          tabType: 'releasesInNextTwoWorkingDays',
        },
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '1 Sep 2022',
          releaseDateLabel: 'CRD',
          tabType: 'futureReleases',
        },
      ],
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('input[id="activeTab"]').val()).toBe('releases-in-two-working-days')
    expect($('.govuk-tabs__list a').text()).toContain('Releases in next 2 working days')
    expect($('.govuk-tabs__list a').text()).toContain('Future releases')
    expect($('.govuk-tabs__list a').text()).not.toContain('Attention needed')
  })

  it('should show result count while search', () => {
    config.hardStopEnabled = true
    const search = 'Jo'
    const prisonsToDisplay = ''
    const probationView = false
    const $ = render({
      cases: [
        {
          name: 'John Smith',
          prisonerNumber: 'A1234AB',
          releaseDate: '1 Sep 2022',
          releaseDateLabel: 'CRD',
          tabType: 'futureReleases',
        },
        {
          name: 'John Deer',
          prisonerNumber: 'A1234AC',
          releaseDate: '10 Sep 2022',
          releaseDateLabel: 'CRD',
          tabType: 'attentionNeeded',
        },
      ],
      statusConfig,
      search,
      prisonsToDisplay,
      probationView,
    })
    expect($('input[id="activeTab"]').val()).toBe('future-releases')
    expect($('.govuk-tabs__list a').text()).toContain('Releases in next 2 working days (0 results)')
    expect($('.govuk-tabs__list a').text()).toContain('Future releases (1 result)')
    expect($('.govuk-tabs__list a').text()).toContain('Attention needed (1 result)')
  })
})
