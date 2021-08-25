import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../utils/nunjucksSetup'

describe('View Partials - Breadcrumbs', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  it('should display the breadcrumb links correctly', () => {
    viewContext = {
      title: 'Page title',
      breadCrumbList: [
        {
          title: 'page 1',
          href: 'link 1',
        },
        {
          title: 'page 2',
          href: 'link 2',
        },
      ],
    }
    const nunjucksString =
      '{% from "partials/breadCrumb.njk" import breadCrumb %}{{ breadCrumb(title, breadCrumbList)}}'
    compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('ol > li:nth-child(1)').text().trim()).toBe('Home')
    expect($('ol > li:nth-child(1) > a').attr('href')).toBe('/')
    expect($('ol > li:nth-child(2)').text().trim()).toBe('page 1')
    expect($('ol > li:nth-child(2) > a').attr('href')).toBe('link 1')
    expect($('ol > li:nth-child(3)').text().trim()).toBe('page 2')
    expect($('ol > li:nth-child(3) > a').attr('href')).toBe('link 2')
    expect($('ol > li:nth-child(4)').text().trim()).toBe('Page title')
  })
})
