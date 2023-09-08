import fs from 'fs'
import { templateRenderer } from '../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/index.njk').toString())

describe('Views - Home', () => {
  it('should display create licence card when flag is true in context', () => {
    const $ = render({ shouldShowCreateLicenceCard: true })

    expect($('#createLicenceCard').length).toBe(1)
  })

  it('should hide create licence card when flag is false in context', () => {
    const $ = render({ shouldShowCreateLicenceCard: false })

    expect($('#createLicenceCard').length).toBe(0)
  })

  it('should display vary licence card when flag is true in context', () => {
    const $ = render({ shouldShowVaryLicenceCard: true })

    expect($('#varyLicenceCard').length).toBe(1)
  })

  it('should hide vary licence card when flag is false in context', () => {
    const $ = render({ shouldShowVaryLicenceCard: false })

    expect($('#varyLicenceCard').length).toBe(0)
  })

  it('should display approve licence card when flag is true in context', () => {
    const $ = render({ shouldShowApproveLicenceCard: true })

    expect($('#approveLicenceCard').length).toBe(1)
  })

  it('should hide approve licence card when flag is false in context', () => {
    const $ = render({ shouldShowApproveLicenceCard: false })

    expect($('#approveLicenceCard').length).toBe(0)
  })

  it('should hide my caseload card when flag is false in context', () => {
    const $ = render({ shouldShowMyCaseloadCard: false })

    expect($('#myCaseloadCard').length).toBe(0)
  })

  it('should display approve variations card when flag is true in context', () => {
    const $ = render({ shouldShowVaryApprovalCard: true })

    expect($('#approveVariationCard').length).toBe(1)
  })

  it('should hide approve variations card when flag is false in context', () => {
    const $ = render({ shouldShowVaryApprovalCard: false })

    expect($('#approveLicenceCard').length).toBe(0)
  })

  it('should show only view and print card for readonly users', () => {
    const $ = render({
      shouldShowViewOrPrintCard: true,
      shouldShowMyCaseloadCard: false,
      shouldShowApproveLicenceCard: false,
      shouldShowCreateLicenceCard: false,
      shouldShowVaryApprovalCard: false,
    })

    expect($('#viewLicenceCard').length).toBe(1)
    expect($('#myCaseloadCard').length).toBe(0)
    expect($('#approveLicenceCard').length).toBe(0)
    expect($('#createLicenceCard').length).toBe(0)
    expect($('#approveVariationCard').length).toBe(0)
  })
})
