import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/initialAppointment/prisonCreated/selectAddress.njk').toString(),
)

describe('selectAddress', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders single address', () => {
    const licenceId = '12345'
    const searchQuery = 'AB12CD'

    const $ = render({
      addresses: [
        {
          firstLine: '1 PRUNUS WALK',
          secondLine: 'FLAT 2b',
          townOrCity: 'SWINDON',
          postcode: 'HN5 8UH',
        },
      ],
      licenceId,
      searchQuery,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place`,
    })

    expect($('.govuk-heading-l').text()).toContain('Confirm address')
    expect($('.govuk-body').text()).toContain(`One address found for ${searchQuery}`)
    const singleAddress = $('[data-qa="single-address"]')
    expect(singleAddress.length).toBeGreaterThan(0)
  })

  it('render multiple addresses', () => {
    const licenceId = '12345'
    const searchQuery = 'AB12CD'

    const $ = render({
      addresses: [
        {
          firstLine: '1 PRUNUS WALK',
          secondLine: 'FLAT 2b',
          townOrCity: 'SWINDON',
          postcode: 'HN5 8UH',
        },
        {
          firstLine: '2 PRUNUS WALK',
          secondLine: 'FLAT 2b',
          townOrCity: 'SWINDON',
          postcode: 'HN5 8UH',
        },
      ],
      licenceId,
      searchQuery,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place`,
    })

    expect($('.govuk-heading-l').text()).toContain('Select address')
    expect($('.govuk-body').text()).toContain(`2 addresses found for ${searchQuery}`)
    const multipleAddress = $('[data-qa="multiple-address"]')
    expect(multipleAddress.length).toBeGreaterThan(0)
  })
})
