import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../utils/nunjucksSetup'

describe('View Partials - Header', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  it('should include user information when user is provided in context', () => {
    viewContext = {
      user: {
        displayName: 'John Smith',
      },
    }
    const nunjucksString = '{% include "partials/header.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#user-block > div:nth-child(1)').text().trim()).toBe('J. Smith')
  })

  it('should not include user information when user is not provided in context', () => {
    viewContext = {}
    const nunjucksString = '{% include "partials/header.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#user-block').length).toBe(0)
  })
})
