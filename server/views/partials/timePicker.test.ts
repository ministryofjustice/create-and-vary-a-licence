import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../utils/nunjucksSetup'

describe('View Partials - Time Picker', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  it('should show label when label is provided in context', () => {
    viewContext = {
      options: {
        id: 'id',
        label: {
          text: 'Label',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#id-label').text().trim()).toBe('Label')
  })

  it('should not show label when label is not provided in context', () => {
    viewContext = {
      options: {
        id: 'id',
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#id-label').length).toBe(0)
  })

  it('should show hint when hint is provided in context', () => {
    viewContext = {
      options: {
        hint: {
          text: 'Hint',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-hint').text().trim()).toBe('Hint')
  })

  it('should not show hint when hint is not provided in context', () => {
    viewContext = {
      options: {},
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-hint').length).toBe(0)
  })
})
