import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import ViewActiveLicenceRoutes from './viewActiveLicence'
import { LicenceApiClient } from '../../../data'

const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
const conditionService = new ConditionService(licenceApiClient) as jest.Mocked<ConditionService>

jest.mock('../../../data/licenceApiClient')
jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('Route Handlers - Vary Licence - View active licence', () => {
  const handler = new ViewActiveLicenceRoutes(conditionService)
  let req: Request
  let res: Response

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
    licenceApiClient.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
    conditionService.additionalConditionsCollection.mockReturnValue({
      additionalConditions: [],
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
  })

  describe('GET', () => {
    it('should render a licence view for active licence', async () => {
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewActive', {
        callToActions: { shouldShowVaryButton: true },
        isInPssPeriod: false,
        additionalConditions: [],
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
  })
})
