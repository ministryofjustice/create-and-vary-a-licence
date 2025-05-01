import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import ViewActiveLicenceRoutes from './viewActiveLicence'
import HdcService, { CvlHdcLicenceData } from '../../../services/hdcService'
import LicenceKind from '../../../enumeration/LicenceKind'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const hdcService = new HdcService(null) as jest.Mocked<HdcService>

jest.mock('../../../services/conditionService')
jest.mock('../../../services/hdcService')

describe('Route Handlers - Vary Licence - View active licence', () => {
  let req: Request
  let res: Response
  const handler = new ViewActiveLicenceRoutes(conditionService, hdcService)
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

  const exampleHdcLicenceData = {
    curfewAddress: {
      addressLine1: 'addressLineOne',
      addressLine2: 'addressLineTwo',
      townOrCity: 'addressTownOrCity',
      county: 'county',
      postcode: 'addressPostcode',
    },
    firstNightCurfewHours: {
      firstNightFrom: '09:00',
      firstNightUntil: '17:00',
    },
    curfewTimes: [
      {
        curfewTimesSequence: 1,
        fromDay: 'MONDAY',
        fromTime: '17:00:00',
        untilDay: 'TUESDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 2,
        fromDay: 'TUESDAY',
        fromTime: '17:00:00',
        untilDay: 'WEDNESDAY',
        untilTime: '09:00:00',
      },
    ],
    allCurfewTimesEqual: true,
  } as CvlHdcLicenceData

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
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
    const condition = { code: 'code5', text: 'Conditon 5', category: 'group1', requiresInput: false }
    conditionService.getAdditionalConditionByCode.mockResolvedValue(condition)
    hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)
  })

  describe('GET', () => {
    it('should render a licence view for active licence', async () => {
      conditionService.getAdditionalAPConditionsForSummaryAndPdf.mockResolvedValue([
        {
          text: 'Condition 1',
          code: 'CON1',
          data: [],
          uploadSummary: [],
        },
      ])

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewActive', {
        callToActions: { shouldShowVaryButton: true },
        additionalConditions: [
          [
            {
              text: 'Condition 1',
              code: 'CON1',
              data: [],
              uploadSummary: [],
            },
          ],
        ],
        hdcLicenceData: null,
        isPPUser: false,
        statusCode: LicenceStatus.ACTIVE,
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

    it('should pass through the HDC licence data when it is a HDC licence', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          ...res.locals,
          licence: {
            ...licence,
            kind: LicenceKind.HDC,
          },
        },
      } as unknown as Response

      conditionService.getAdditionalAPConditionsForSummaryAndPdf.mockResolvedValue([
        {
          text: 'Condition 1',
          code: 'CON1',
          data: [],
          uploadSummary: [],
        },
      ])

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewActive', {
        callToActions: { shouldShowVaryButton: true },
        additionalConditions: [
          [
            {
              text: 'Condition 1',
              code: 'CON1',
              data: [],
              uploadSummary: [],
            },
          ],
        ],
        hdcLicenceData: exampleHdcLicenceData,
        isPPUser: false,
        statusCode: LicenceStatus.ACTIVE,
      })
    })
  })
})
