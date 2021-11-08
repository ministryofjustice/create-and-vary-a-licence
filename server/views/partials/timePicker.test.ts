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

    expect($('legend').text().trim()).toBe('Label')
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

    expect($('legend').length).toBe(0)
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

  it('should add error class to form group if error exists', () => {
    viewContext = {
      options: {
        errorMessage: {
          text: 'error',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group').attr('class')).toContain('govuk-form-group--error')
  })

  it('should not add error class to form group when error does not exist', () => {
    viewContext = {
      options: {},
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-form-group').attr('class')).not.toContain('govuk-form-group--error')
  })

  it('should display error span if error exists', () => {
    viewContext = {
      options: {
        errorMessage: {
          text: 'error',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-error-message').length).toBe(1)
    expect($('.govuk-error-message > span:nth-child(2)').text().trim()).toBe('error')
  })

  it('should not display error span when error does not exist', () => {
    viewContext = {
      options: {},
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-error-message').length).toBe(0)
  })

  it('should mark AM time option as selected when AM is in the form response', () => {
    viewContext = {
      options: {
        id: 'timePicker',
        formResponses: {
          ampm: 'am',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#timePicker-ampm > option:nth-child(1)').attr('selected')).toBe('selected')
    expect($('#timePicker-ampm > option:nth-child(2)').attr('selected')).toBeUndefined()
  })

  it('should mark PM time option as selected when AM is in the form response', () => {
    viewContext = {
      options: {
        id: 'timePicker',
        formResponses: {
          ampm: 'pm',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#timePicker-ampm > option:nth-child(1)').attr('selected')).toBeUndefined()
    expect($('#timePicker-ampm > option:nth-child(2)').attr('selected')).toBe('selected')
  })

  it('should mark AM time option as selected when AM is in the form response', () => {
    viewContext = {
      options: {
        id: 'timePicker',
        formResponses: {
          ampm: 'am',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#timePicker-ampm > option:nth-child(1)').attr('selected')).toBe('selected')
    expect($('#timePicker-ampm > option:nth-child(2)').attr('selected')).toBeUndefined()
  })

  it('should not mark either time option as selected when timePicker is not in the form response', () => {
    viewContext = {
      options: {
        id: 'timePicker',
        formResponses: {},
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#timePicker-ampm > option:nth-child(1)').attr('selected')).toBeUndefined()
    expect($('#timePicker-ampm > option:nth-child(2)').attr('selected')).toBeUndefined()
  })

  it('should add error class to inputs when an error is present', () => {
    viewContext = {
      options: {
        id: 'timePicker',
        errorMessage: {
          text: 'error',
        },
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#timePicker-hour').hasClass('govuk-input--error')).toBe(true)
    expect($('#timePicker-minute').hasClass('govuk-input--error')).toBe(true)
    expect($('#timePicker-ampm').hasClass('govuk-select--error')).toBe(true)
  })

  it('should not add error class to inputs when an error is not present', () => {
    viewContext = {
      options: {
        id: 'timePicker',
      },
    }
    const nunjucksString = '{% from "partials/timePicker.njk" import timePicker %}{{ timePicker(options)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#timePicker-hour').hasClass('govuk-input--error')).toBe(false)
    expect($('#timePicker-minute').hasClass('govuk-input--error')).toBe(false)
    expect($('#timePicker-ampm').hasClass('govuk-select--error')).toBe(false)
  })
})
