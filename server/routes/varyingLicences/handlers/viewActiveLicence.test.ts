import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import ViewActiveLicenceRoutes from './viewActiveLicence'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>

jest.mock('../../../services/conditionService')

describe('Route Handlers - Vary Licence - View active licence', () => {
  let req: Request
  let res: Response
  const handler = new ViewActiveLicenceRoutes(conditionService)
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
  })
})
