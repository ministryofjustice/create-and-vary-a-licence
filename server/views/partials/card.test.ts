import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import ConditionService from '../../services/conditionService'
import { registerNunjucks } from '../../utils/nunjucksSetup'

describe('View Partials - Card', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
  const njkEnv = registerNunjucks(conditionService)

  it('should add clickable class when clickable=true', () => {
    viewContext = {
      options: {
        clickable: true,
      },
    }
    const nunjucksString = '{% from "partials/card.njk" import card %}{{ card(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.card--clickable').length).toBe(1)
  })

  it('should not add clickable class when clickable=false', () => {
    viewContext = {
      options: {
        clickable: false,
      },
    }
    const nunjucksString = '{% from "partials/card.njk" import card %}{{ card(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.card--clickable').length).toBe(0)
  })

  it('should display heading as link if href is populated', () => {
    viewContext = {
      options: {
        href: 'link',
        heading: 'Heading',
      },
    }
    const nunjucksString = '{% from "partials/card.njk" import card %}{{ card(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h2 > a').attr('href')).toBe('link')
    expect($('h2 > a').text().trim()).toBe('Heading')
  })

  it('should display heading as normal text if href is not populated', () => {
    viewContext = {
      options: {
        heading: 'Heading',
      },
    }
    const nunjucksString = '{% from "partials/card.njk" import card %}{{ card(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('h2 > a').length).toBe(0)
    expect($('h2').text().trim()).toBe('Heading')
  })
})
