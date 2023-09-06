import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/manageConditions/bespokeConditions.njk').toString())

describe('Create a Licence Views - Bespoke Conditions', () => {
  it('should display just one textarea if no conditions exist on the licence already', () => {
    const $ = render({
      conditions: undefined,
    })

    expect($('textarea').length).toBe(1)
  })

  it('should not display a remove button if no conditions exist on the licence already', () => {
    const $ = render({
      conditions: undefined,
    })

    expect($('.moj-add-another__remove-button').length).toBe(0)
  })

  it('should display just one populated textarea if only 1 condition exists on the licence', () => {
    const $ = render({
      conditions: ['bespokeCondition1'],
    })

    expect($('textarea').length).toBe(1)
    expect($('#conditions\\[0\\]').text()).toBe('bespokeCondition1')
  })

  it('should not display a remove button if just one condition exists on the licence', () => {
    const $ = render({
      conditions: ['bespokeCondition1'],
    })

    expect($('.moj-add-another__remove-button').length).toBe(0)
  })

  it('should display two populated textareas if 2 conditions exist on the licence', () => {
    const $ = render({
      conditions: ['bespokeCondition1', 'bespokeCondition2'],
    })

    expect($('textarea').length).toBe(2)
    expect($('#conditions\\[0\\]').text()).toBe('bespokeCondition1')
    expect($('#conditions\\[1\\]').text()).toBe('bespokeCondition2')
  })

  it('should display two remove buttons if 2 conditions exist on the licence', () => {
    const $ = render({
      conditions: ['bespokeCondition1', 'bespokeCondition2'],
    })

    expect($('.moj-add-another__remove-button').length).toBe(2)
  })
})
