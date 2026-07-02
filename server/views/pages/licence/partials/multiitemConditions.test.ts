import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

describe('multiItemConditions check plural text is correctly selected', () => {
  const render = templateRenderer(
    '{% from "pages/licence/partials/multiItemConditions.njk" import multiItemConditions %}{{ multiItemConditions(multipleItemConditions) }}',
  )

  it('should not render anything if multipleItemConditions is empty', () => {
    const $ = render({ multipleItemConditions: [] })
    expect($('.condition').length).toBe(0)
  })

  it('should render the plural form when textPlural is present', () => {
    const $ = render({
      multipleItemConditions: [
        [
          { textPlural: 'You must not enter the following areas:', text: 'You must not enter the following area:' },
          { textPlural: 'You must not enter the following areas:', text: 'You must not enter the following area:' },
        ],
        [
          { textPlural: 'You must not leave the following areas:', text: 'You must not leave the following area:' },
          { textPlural: 'You must not leave the following areas:', text: 'You must not leave the following area:' },
        ],
      ],
    })
    expect($('.condition:nth-of-type(1) span').text()).toBe('You must not enter the following areas:')
    expect($('.condition:nth-of-type(2) span').text()).toBe('You must not leave the following areas:')
    expect($('.condition').length).toBe(2)
  })

  it('should render the plural form when condition textPlural is present and display both texts if pluralText is not present', () => {
    const $ = render({
      multipleItemConditions: [
        [
          { textPlural: 'You must not enter the following areas:', text: 'You must not enter the following area:' },
          { textPlural: 'You must not enter the following areas:', text: 'You must not enter the following area:' },
        ],
        [{ text: 'You must not leave the following area:' }, { text: 'You must not leave the following area:' }],
      ],
    })
    expect($('.condition').length).toBe(2)
    expect($('.condition:nth-of-type(1) span').text()).toBe('You must not enter the following areas:')
    expect($('.condition:nth-of-type(2) span').text()).toBe('You must not leave the following area:')
    expect($('.condition:nth-of-type(2) p:nth-of-type(1)').text().trim()).toBe('You must not leave the following area:')
  })
})
