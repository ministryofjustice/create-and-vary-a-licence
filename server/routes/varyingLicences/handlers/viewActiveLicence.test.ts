import { Request, Response } from 'express'

import { addDays, format, subDays } from 'date-fns'
import ViewActiveLicenceRoutes from './viewActiveLicence'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import LicenceService from '../../../services/licenceService'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('Route Handlers - Vary Licence - View active licence', () => {
  const handler = new ViewActiveLicenceRoutes(conditionService, licenceService)
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
    licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
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
        inPssPeriod: false,
        parentOrSelfAdditionalAPConditions: [],
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

    it('should render a licence view with PSS period true', async () => {
      res = {
        ...res,
        locals: {
          ...res.locals,
          licence: {
            ...licence,
            licenceExpiryDate: format(subDays(new Date(), 1), 'dd/MM/yyyy'),
            topupSupervisionExpiryDate: format(addDays(new Date(), 1), 'dd/MM/yyyy'),
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewActive', {
        callToActions: { shouldShowVaryButton: true },
        inPssPeriod: true,
        parentOrSelfAdditionalAPConditions: [],
        conditionsWithUploads: [],
      })
    })
  })
})
