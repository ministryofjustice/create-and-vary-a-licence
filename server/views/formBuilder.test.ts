import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../utils/nunjucksSetup'

describe('View Partials - Form builder', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  it('should display the placeOfResidence partial correctly', () => {
    viewContext = {
      options: {
        inputTemplate: 'placeOfResidence',
      },
    }
    const nunjucksString = '{% from "formBuilder.njk" import formBuilder %}{{ formBuilder(options) }}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#regionOfResidence').length).toBe(1)
  })

  it('should not display the placeOfResidence partial', () => {
    viewContext = {
      options: {
        inputTemplate: '',
      },
    }
    const nunjucksString = '{% from "formBuilder.njk" import formBuilder %}{{ formBuilder(options) }}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#regionOfResidence').length).toBe(0)
  })
})
