import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import VariationSummaryRoutes from './variationSummary'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { VariedConditions } from '../../../utils/licenceComparator'
import ApprovalComment from '../../../@types/ApprovalComment'
import ProbationService from '../../../services/probationService'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const probationService = new ProbationService(null, null) as jest.Mocked<ProbationService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/probationService')

describe('Route Handlers - Vary Licence - Variation summary', () => {
  const handler = new VariationSummaryRoutes(licenceService, probationService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          id: 1,
          statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      licenceService.compareVariationToOriginal.mockResolvedValue({
        licenceConditionsAdded: [],
      } as VariedConditions)

      licenceService.getApprovalConversation.mockResolvedValue([
        { who: 'X', when: '12/02/2022 11:05:00', comment: 'Reason', role: 'COM' },
        { who: 'Y', when: '13/02/2022 10:00:00', comment: 'Reason', role: 'APPROVER' },
      ] as ApprovalComment[])

      await handler.GET(req, res)

      expect(licenceService.compareVariationToOriginal).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_IN_PROGRESS },
        { username: 'joebloggs' }
      )

      expect(licenceService.getApprovalConversation).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_IN_PROGRESS },
        { username: 'joebloggs' }
      )

      expect(res.render).toHaveBeenCalledWith('pages/vary/variationSummary', {
        conversation: [
          { who: 'X', when: '12/02/2022 11:05:00', comment: 'Reason', role: 'COM' },
          { who: 'Y', when: '13/02/2022 10:00:00', comment: 'Reason', role: 'APPROVER' },
        ],
        conditionComparison: {
          licenceConditionsAdded: [],
        },
      })
    })
  })

  describe('POST', () => {
    it('should submit the variation response and redirect to the confirmation page', async () => {
      probationService.getPduHeads.mockResolvedValue([
        {
          email: 'jbloggs@probation.gov.uk',
          name: {
            forename: 'Joe',
            surname: 'Bloggs',
          },
        },
      ])

      await handler.POST(req, res)

      expect(licenceService.submitVariation).toHaveBeenCalledWith(
        1,
        [{ name: 'Joe Bloggs', email: 'jbloggs@probation.gov.uk' }],
        { username: 'joebloggs' }
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/confirmation')
    })
  })
})
