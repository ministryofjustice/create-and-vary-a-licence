import { Request, Response } from 'express'

import ViewVariationRoutes from './viewVariation'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceService from '../../../services/licenceService'
import { VariedConditions } from '../../../utils/licenceComparator'
import ApprovalComment from '../../../@types/ApprovalComment'

const username = 'joebloggs'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route - Vary - View variation', () => {
  const handler = new ViewVariationRoutes(licenceService)
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

    it('should redirect to check your answers if variation is in progress', async () => {
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

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
