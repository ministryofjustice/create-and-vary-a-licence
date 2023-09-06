import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

describe('View Partials - Card', () => {
  const render = templateRenderer('{% from "partials/card.njk" import card %}{{ card(options)}}')

  it('should add clickable class when clickable=true', () => {
    const $ = render({
      options: {
        clickable: true,
      },
    })

    expect($('.card--clickable').length).toBe(1)
  })

  it('should not add clickable class when clickable=false', () => {
    const $ = render({
      options: {
        clickable: false,
      },
    })

    expect($('.card--clickable').length).toBe(0)
  })

  it('should display heading as link if href is populated', () => {
    const $ = render({
      options: {
        href: 'link',
        heading: 'Heading',
      },
    })

    expect($('h2 > a').attr('href')).toBe('link')
    expect($('h2 > a').text().trim()).toBe('Heading')
  })

  it('should display heading as normal text if href is not populated', () => {
    const $ = render({
      options: {
        heading: 'Heading',
      },
    })

    expect($('h2 > a').length).toBe(0)
    expect($('h2').text().trim()).toBe('Heading')
  })
})
