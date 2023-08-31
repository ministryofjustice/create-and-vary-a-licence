import fs from 'fs'
import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import LicenceService from '../../../services/licenceService'

const snippet = fs.readFileSync('server/views/pages/vary/viewActive.njk')
const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('ViewActive', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>
  const njkEnv = registerNunjucks(conditionService)

  const licence = {
    id: 1,
    surname: 'Bobson',
    forename: 'Bob',
    statusCode: LicenceStatus.ACTIVE,
    appointmentTime: '12/12/2022 14:16',
    additionalLicenceConditions: [],
    additionalPssConditions: [],
    bespokeConditions: [],
  } as Licence

  const additionalConditionInputs = [
    [
      {
        text: 'Condition 1',
        requiresInput: false,
        code: 'CON1',
        data: {},
        uploadSummary: {},
      },
    ],
  ]

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
    const condition = { code: 'code5', text: 'Conditon 5', category: 'group1', requiresInput: false }
    conditionService.getAdditionalConditionByCode.mockResolvedValue(condition)
  })

  it('should display expired section if licence type is AP_PSS, is in pss period, isActivatedInPssPeriod with additional conditions', () => {
    viewContext = {
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: true,
        isActivatedInPssPeriod: true,
      },
      additionalConditions: additionalConditionInputs,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#conditions-expired').text()).toBe('Conditions from expired licence')
  })

  it('should display expired section if licence type is AP_PSS, is in pss period, in variation with additional conditions', () => {
    viewContext = {
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: true,
        isActivatedInPssPeriod: false,
        statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
      },
      additionalConditions: additionalConditionInputs,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#conditions-expired').text()).toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is AP_PSS, is not in pss period, in variation with additional conditions', () => {
    viewContext = {
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: false,
        isActivatedInPssPeriod: false,
        statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
      },
      additionalConditions: additionalConditionInputs,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is AP_PSS, is in pss period, not in variation and not activated in pss period with additional conditions', () => {
    viewContext = {
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: false,
        isActivatedInPssPeriod: false,
        statusCode: LicenceStatus.ACTIVE,
      },
      additionalConditions: additionalConditionInputs,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is AP_PSS, is in pss period, not in variation and is activated in pss period with no additional conditions', () => {
    viewContext = {
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: false,
        isActivatedInPssPeriod: true,
        statusCode: LicenceStatus.ACTIVE,
      },
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is not AP_PSS, is in pss period, not in variation and is activated in pss period with additional conditions', () => {
    viewContext = {
      licence: {
        ...licence,
        typeCode: 'AP',
        isInPssPeriod: false,
        isActivatedInPssPeriod: true,
        statusCode: LicenceStatus.ACTIVE,
      },
      additionalConditions: additionalConditionInputs,
    }
    const $ = cheerio.load(compiledTemplate.render(viewContext))
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })
})
