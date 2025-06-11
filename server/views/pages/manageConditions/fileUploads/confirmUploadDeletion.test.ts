import fs from 'fs'
import { templateRenderer } from '../../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(
  fs.readFileSync('server/views/pages/manageConditions/fileUploads/confirmUploadDeletion.njk').toString(),
)

describe('Confirm Upload Deletion view', () => {
  it('Renders header containing file description if the description is provided', () => {
    const $ = render({ conditionId: '123', conditionCode: 'abc123', description: 'Test file' })

    expect($('legend').text().trim()).toBe('Are you sure you want to delete the map for Test file?')
  })

  it('Renders generic header if no description is provided', () => {
    const $ = render({ conditionId: '123', conditionCode: 'abc123', description: null })

    expect($('legend').text().trim()).toBe('Are you sure you want to delete this untitled map?')
  })
})
