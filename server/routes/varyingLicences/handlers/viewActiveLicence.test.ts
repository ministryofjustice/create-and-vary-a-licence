import fs from 'fs'
import * as cheerio from 'cheerio'
import { Request, Response } from 'express'
import nunjucks, { Template } from 'nunjucks'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import ViewActiveLicenceRoutes from './viewActiveLicence'
import { LicenceApiClient } from '../../../data'
import { registerNunjucks } from '../../../utils/nunjucksSetup'
import LicenceService from '../../../services/licenceService'

const snippet = fs.readFileSync('server/views/pages/vary/viewActive.njk')

const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
const conditionService = new ConditionService(licenceApiClient) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, conditionService) as jest.Mocked<LicenceService>

jest.mock('../../../data/licenceApiClient')
jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('Route Handlers - Vary Licence - View active licence', () => {
  const handler = new ViewActiveLicenceRoutes(conditionService)
  let req: Request
  let res: Response
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
    {
      text: 'Condition 1',
      requiresInput: false,
      code: 'CON1',
      data: {},
      uploadSummary: {},
    },
  ]

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
    conditionService.additionalConditionsCollection.mockReturnValue({
      additionalConditions: [
        {
          text: 'Condition 1',
          code: 'CON1',
          data: [],
          uploadSummary: [],
        },
      ],
      conditionsWithUploads: [],
    })
    req = {
      params: {
        licenceId: licence.id,
      },
      query: {},
      flash: jest.fn(),
    } as unknown as Request
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence,
      },
    } as unknown as Response
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
    viewContext = {}
    const condition = { code: 'code5', text: 'Conditon 5', category: 'group1', requiresInput: false }
    conditionService.getAdditionalConditionByCode.mockResolvedValue(condition)
  })

  describe('GET', () => {
    it('should render a licence view for active licence', async () => {
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewActive', {
        callToActions: { shouldShowVaryButton: true },
        additionalConditions: [
          {
            text: 'Condition 1',
            code: 'CON1',
            data: [],
            uploadSummary: [],
          },
        ],
        conditionsWithUploads: [],
      })
    })

    it('should show timeline if licence is not active', async () => {
      res = {
        ...res,
        locals: {
          ...res.locals,
          licence: {
            ...licence,
            statusCode: LicenceStatus.INACTIVE,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith(`/licence/vary/id/${licence.id}/timeline`)
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
})
