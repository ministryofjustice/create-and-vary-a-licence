import { Request, Response } from 'express'

import ViewVariationRoutes from './viewVariation'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceService from '../../../services/licenceService'
import { VariedConditions } from '../../../utils/licenceComparator'
import ApprovalComment from '../../../@types/ApprovalComment'
import ConditionService from '../../../services/conditionService'

const username = 'joebloggs'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('Route - Vary - View variation', () => {
  const handler = new ViewVariationRoutes(licenceService, conditionService)
  let req: Request
  let res: Response

  const licence = {
    id: 1,
    surname: 'Bobson',
    forename: 'Bob',
    appointmentTime: '12/12/2022 14:16',
    additionalLicenceConditions: [],
    additionalPssConditions: [],
    bespokeConditions: [],
  } as Licence

  const conversation = [] as ApprovalComment[]

  const conditionComparison = {
    licenceConditionsAdded: [],
  } as VariedConditions

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    licenceService.getApprovalConversation.mockResolvedValue(conversation)
    licenceService.compareVariationToOriginal.mockResolvedValue(conditionComparison)
  })

  describe('GET', () => {
    it('should render a licence view for active licence', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.ACTIVE,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewSubmitted', {
        callToActions: {
          shouldShowEditAndDiscardButton: false,
        },
        conditionComparison,
        conversation,
      })
    })

    it('should show edit and discard buttons when variation is in submitted state', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_SUBMITTED,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewSubmitted', {
        conversation,
        conditionComparison,
        callToActions: {
          shouldShowEditAndDiscardButton: true,
        },
      })
    })

    it('should show edit and discard buttons when variation is in rejected state', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_REJECTED,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewSubmitted', {
        conversation,
        conditionComparison,
        callToActions: {
          shouldShowEditAndDiscardButton: true,
        },
      })
    })

    it('should show print, edit and discard buttons when variation is in approved state', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_APPROVED,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewSubmitted', {
        conversation,
        conditionComparison,
        callToActions: {
          shouldShowEditAndDiscardButton: false,
        },
      })
    })

    it('should redirect to check your answers if variation is in progress and the licence version is up to date', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
          },
        },
      } as unknown as Response

      licenceService.getParentLicenceOrSelf.mockResolvedValue({version:'2.0'} as Licence)
      conditionService.getVersion.mockResolvedValue('2.0')

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should redirect to policy changes if variation is in progress and the licence version is out of date', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
          },
        },
      } as unknown as Response

      licenceService.getParentLicenceOrSelf.mockResolvedValue({version:'1.0'} as Licence)
      conditionService.getVersion.mockResolvedValue('2.0')

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes')
    })
  })
})
