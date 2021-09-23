import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/create/confirmation.njk')

describe('Create a licence - confirmation', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {
      exitSurveyLink: 'test-exit-survey',
      licence: {
        forename: 'Bobby',
        surname: 'Z',
        prisonDescription: 'Leeds',
      },
    }
  })

  it('should display the name, prison and exit survey link', () => {
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#exit-survey').attr('href')).toBe('test-exit-survey')
    expect($('#sent-to').text().trim()).toBe('We have sent the licence conditions to Leeds for approval.')
    expect($('.govuk-panel__title').text().trim()).toBe('Licence conditions for Bobby Z sent')
  })
})
