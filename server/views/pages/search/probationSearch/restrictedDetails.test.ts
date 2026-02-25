import fs from 'fs'

import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/search/probationSearch/restrictedDetails.njk').toString(),
)

describe('View Restricted Details Page', () => {
  it('should display all elements with correct IDs and content', () => {
    const $ = render({ crn: 'X339451', message: 'This record has been restricted due to sensitive information' })

    expect($('#restricted-access-heading').text().trim()).toContain('Access restricted on NDelius')
    expect($('#crn-caption').text().trim()).toBe('CRN: X339451')

    const description = $('#restricted-access-description')
    expect(description.text()).toContain("Access to this person's details has been restricted on NDelius")
    expect(description.text()).toContain('This could be because the information is sensitive')

    expect($('#additional-info-heading').text().trim()).toBe('Additional information from NDelius')
    expect($('#recorded-by-hint').text().trim()).toBe('Recorded by the person who restricted access.')
    expect($('#restriction-message').text().trim()).toBe('This record has been restricted due to sensitive information')
    expect($('#guidance-heading').text().trim()).toBe('If you need more guidance')

    expect($('#equip-link-paragraph').length).toBe(1)
    const equipLink = $('#equip-link')
    expect(equipLink.text().replace(/\s+/g, ' ').trim()).toBe('Check EQuiP to find out more about restricted access')
    expect(equipLink.attr('href')).toContain('equip-portal.equip.service.justice.gov.uk')

    expect($('#button-group').length).toBe(1)

    const returnButton = $('[data-qa="return-to-cases"]')
    expect(returnButton.length).toBe(1)
    expect(returnButton.text().trim()).toBe('Return to cases')
    expect(returnButton.attr('href')).toBe('/licence/create/caseload')
  })
})
