import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/index.njk')

describe('Views - Home', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display create licence card when flag is true in context', () => {
    viewContext = { shouldShowCreateLicenceCard: true }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#createLicenceCard').length).toBe(1)
  })

  it('should hide create licence card when flag is false in context', () => {
    viewContext = { shouldShowCreateLicenceCard: false }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#createLicenceCard').length).toBe(0)
  })

  it('should display vary licence card when flag is true in context', () => {
    viewContext = { shouldShowVaryLicenceCard: true }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#varyLicenceCard').length).toBe(1)
  })

  it('should hide vary licence card when flag is false in context', () => {
    viewContext = { shouldShowVaryLicenceCard: false }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#varyLicenceCard').length).toBe(0)
  })

  it('should display approve licence card when flag is true in context', () => {
    viewContext = { shouldShowApproveLicenceCard: true }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#approveLicenceCard').length).toBe(1)
  })

  it('should hide approve licence card when flag is false in context', () => {
    viewContext = { shouldShowApproveLicenceCard: false }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#approveLicenceCard').length).toBe(0)
  })

  /*
  it('should display my caseload card when flag is true in context', () => {
    viewContext = {
      shouldShowMyCaseloadCard: true,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#myCaseloadCard').length).toBe(1)
  })
  */

  it('should hide my caseload card when flag is false in context', () => {
    viewContext = { shouldShowMyCaseloadCard: false }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#myCaseloadCard').length).toBe(0)
  })

  it('should display approve variations card when flag is true in context', () => {
    viewContext = { shouldShowVaryApprovalCard: true }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#approveVariationCard').length).toBe(1)
  })

  it('should hide approve variations card when flag is false in context', () => {
    viewContext = { shouldShowVaryApprovalCard: false }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#approveLicenceCard').length).toBe(0)
  })

  it('should show only view and print card for readonly users', () => {
    viewContext = {
      shouldShowViewOrPrintCard: true,
      shouldShowMyCaseloadCard: false,
      shouldShowApproveLicenceCard: false,
      shouldShowCreateLicenceCard: false,
      shouldShowVaryApprovalCard: false,
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#viewLicenceCard').length).toBe(1)
    expect($('#myCaseloadCard').length).toBe(0)
    expect($('#approveLicenceCard').length).toBe(0)
    expect($('#createLicenceCard').length).toBe(0)
    expect($('#approveVariationCard').length).toBe(0)
  })
})
