import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'

const snippet = fs.readFileSync('server/views/pages/create/caseload.njk')

describe('Create a Licence Views - Caseload', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
  })

  it('should display a table containing the caseload', () => {
    viewContext = {
      caseload: [
        {
          name: 'Adam Balasaravika',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > .caseload-offender-name > span').text()).toBe('Adam Balasaravika')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
  })

  it('should display probation practitioner in the table or unallocated', () => {
    viewContext = {
      caseload: [
        {
          name: 'Adam Balasaravika',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'X12345',
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('tbody .govuk-table__row').length).toBe(2)
    expect($('#name-1 > .caseload-offender-name > button').text()).toBe('Adam Balasaravika')
    expect($('#probation-practitioner-1').text()).toBe('Joe Bloggs')
    expect($('#probation-practitioner-1 > a').attr('href')).toBe(
      '/licence/create/probation-practitioner/staffCode/X12345'
    )

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#probation-practitioner-2').text()).toBe('Unallocated')
  })

  it('should display the caseload with a case outside the pilot area', () => {
    viewContext = {
      statusConfig,
      caseload: [
        {
          name: 'Adam Balasaravika',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffId: 2000,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffId: 2000,
          },
          isClickable: false,
          licenceStatus: LicenceStatus.NOT_IN_PILOT,
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .caseload-offender-name > button').text()).toBe('Adam Balasaravika')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Outside pilot')
  })

  it('should display the caseload with a case as a recall', () => {
    viewContext = {
      statusConfig,
      caseload: [
        {
          name: 'Adam Balasaravika',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffId: 2000,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffId: 2000,
          },
          isClickable: false,
          licenceStatus: LicenceStatus.OOS_RECALL,
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .caseload-offender-name > button').text()).toBe('Adam Balasaravika')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Recall')
  })

  it('should display the caseload with a case as a breach of supervision', () => {
    viewContext = {
      statusConfig,
      caseload: [
        {
          name: 'Adam Balasaravika',
          crnNumber: 'X381306',
          releaseDate: '03 August 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffId: 2000,
          },
          isClickable: true,
          licenceStatus: LicenceStatus.NOT_STARTED,
        },
        {
          name: 'John Smith',
          crnNumber: 'X123456',
          releaseDate: '01 September 2022',
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffId: 2000,
          },
          isClickable: false,
          licenceStatus: LicenceStatus.OOS_BOTUS,
        },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('tbody .govuk-table__row').length).toBe(2)

    expect($('#name-1 > .caseload-offender-name > button').text()).toBe('Adam Balasaravika')
    expect($('#name-1 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X381306')
    expect($('#release-date-1').text()).toBe('03 August 2022')
    expect($('#licence-status-1 > .status-badge').text().trim()).toBe('Not started')

    expect($('#name-2 > .caseload-offender-name > span').text()).toBe('John Smith')
    expect($('#name-2 > .caseload-offender-name > .govuk-hint').text()).toBe('CRN: X123456')
    expect($('#release-date-2').text()).toBe('01 September 2022')
    expect($('#licence-status-2 > .status-badge').text().trim()).toBe('Breach of supervision')
  })
})
