import * as cheerio from 'cheerio'
import nunjucks from 'nunjucks'
import { registerNunjucks } from '../nunjucksSetup'

export const renderTemplate = (template: string, model: Record<string, unknown>) => {
  const njkEnv = registerNunjucks()
  const compiledTemplate = nunjucks.compile(template, njkEnv)
  return cheerio.load(compiledTemplate.render(model))
}

export const templateRenderer = (template: string) => (model: Record<string, unknown>) =>
  renderTemplate(template, model)
