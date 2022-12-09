import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import PolicyChangesNoticeRoutes from './policyChangesNotice'
import { LicenceConditionChange } from '../../../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')

describe('Route handlers', () => {
  const handler = new PolicyChangesNoticeRoutes(licenceService)
  let req: Request
  let res: Response

  const condition1 = {
    changeType: 'TEXT_CHANGE',
    code: 'code1',
    sequence: 1,
    previousText: 'Condition 1 previous text',
    currentText: 'Condition 1 current text',
    dataChanges: [],
    suggestions: [],
  } as LicenceConditionChange

  const condition2 = {
    changeType: 'NEW_OPTIONS',
    code: 'code2',
    sequence: 2,
    previousText: 'Condition 2 text',
    currentText: 'Condition 2 text',
    dataChanges: [],
    suggestions: [],
  } as LicenceConditionChange

  const condition3 = {
    changeType: 'REPLACED',
    code: 'code3',
    sequence: 3,
    previousText: 'Condition 3 current text',
    dataChanges: [],
    suggestions: [{ code: 'code 6', currentText: 'Condition 6' }],
  } as LicenceConditionChange

  licenceService.getPolicyChanges.mockResolvedValue([condition1, condition2, condition3])

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: {},
      query: {},
      session: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        licence: {
          id: '1',
          version: 'version',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('sets the changedConditions in storage to be the sorted policy changes', async () => {
      await handler.GET(req, res)
      expect(req.session.changedConditions).toEqual([condition3, condition1, condition2])
    })

    it('renders the policy changes notice screen', async () => {
      await handler.GET(req, res)

      // Should have a param of the written form of the number of changes
      expect(req.session.changedConditions.length).toEqual(3)
      expect(res.render).toHaveBeenCalledWith('pages/vary/policyChanges', {
        numberOfChanges: 'Three',
      })
    })
  })

  describe('POST', () => {
    it('redirects to the policy changes callback', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes/callback')
    })
  })
})
