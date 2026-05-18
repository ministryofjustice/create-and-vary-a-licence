import fs from 'fs'
import { templateRenderer } from '../../../../../utils/__testutils/templateTestUtils'

describe('NDelius record missing', () => {
  const render = templateRenderer(
    fs.readFileSync('server/views/pages/create/prisonCreated/hardStop/noComAllocated.njk').toString(),
  )

  it('should show the no COM allocated error page', () => {
    const $ = render({
      nomisId: 'A1234AA',
      name: 'Forename Surname',
      licenceStartDate: '26/03/2028',
      dateOfBirth: '14/07/1963',
      backLink: '/licence/view/cases',
    })

    const pipeSeparatedItem = '.pipe-separated__item'
    expect($(pipeSeparatedItem).text()).toContain('Prison number: A1234AA')
    expect($(pipeSeparatedItem).text()).toContain('Release date: 26 March 2028')
    expect($(pipeSeparatedItem).text()).toContain('Date of birth: 14 July 1963')
    expect($('span.govuk-heading-m').text()).toContain('Forename Surname')
  })
})
