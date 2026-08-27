import fs from 'fs'

import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import { HintText } from '../../../config/policyChangeHintText'
import { LicenceConditionChange } from '../../../@types/licenceApiClientTypes'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/policyTextChange.njk').toString())

describe('Policy condition text change', () => {
  it('should display changed condition text', () => {
    const conditionHintText: HintText = {
      code: '322bb3f7-2ee1-46aa-ae1c-3f743efd4327',
      fromVersions: ['1.0', '2.0', '2.1', '3.0'],
      description: ['The condition has been simplified.'],
      bulletpoints: [],
    }

    const conditionChange: LicenceConditionChange = {
      changeType: 'TEXT_CHANGE',
      code: conditionHintText.code,
      sequence: 1,
      previousText: 'old text',
      currentText: 'next text',
      suggestions: [],
    }

    const $ = render({
      licenceId: 3,
      conditionCounter: 1,
      policyChangesCount: 3,
      conditionHintText,
      condition: conditionChange,
    })

    expect($('h1').text()).toContain('Review policy change')
    expect($('h2').text()).toContain('Licence condition being changed')
    expect($('[data-qa="previous-condition-text"]').text()).toContain(conditionChange.previousText)
    expect($('[data-qa="current-condition-text"]').text()).toContain(conditionChange.currentText)
    expect($('[data-qa="condition-hint-text"]').text()).toContain(conditionHintText.description[0])
  })
})
