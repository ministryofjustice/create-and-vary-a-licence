import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../utils/nunjucksSetup'

describe('View Partials - Licence details banner', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  it('should not render anything if licence is not available', () => {
    viewContext = {}
    const nunjucksString = '{% include "partials/licenceDetailsBanner.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('body').text().length).toBe(0)
  })

  it('should not render anything if hideLicenceBanner is true', () => {
    viewContext = {
      licence: {
        crn: '123',
        nomsId: 'ABC',
      },
      hideLicenceBanner: true,
      user: {
        authSource: 'delius',
      },
    }
    const nunjucksString = '{% include "partials/licenceDetailsBanner.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('body').text().length).toBe(0)
  })

  it('should render CRN instead of nomisId if user is delius user', () => {
    viewContext = {
      licence: {
        crn: '123',
        nomsId: 'ABC',
      },
      user: {
        authSource: 'delius',
      },
    }
    const nunjucksString = '{% include "partials/licenceDetailsBanner.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.pipe-separated__item:first').text()).toBe('CRN: 123')
  })

  it('should render nomisId instead of CRN if user is nomis user', () => {
    viewContext = {
      licence: {
        crn: '123',
        nomsId: 'ABC',
      },
      user: {
        authSource: 'nomis',
      },
    }
    const nunjucksString = '{% include "partials/licenceDetailsBanner.njk" %}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.pipe-separated__item:first').text()).toBe('Prison number: ABC')
  })
})
