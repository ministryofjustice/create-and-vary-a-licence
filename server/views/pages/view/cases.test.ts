import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/view/cases.njk').toString())

describe('View and print a licence - case list', () => {
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
})
