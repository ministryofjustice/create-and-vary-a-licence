import { Request, Response } from 'express'
import { LicenceConditionChange } from '../../../@types/licenceApiClientTypes'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'
import PolicyChangeInputCallbackRoutes from './policyChangesInputCallback'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>

jest.mock('../../../services/conditionService')

describe('Route handlers', () => {
  const handler = new PolicyChangeInputCallbackRoutes(conditionService)
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
    suggestions: [{ code: 'code 6' }],
  } as LicenceConditionChange

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        changeCounter: '1',
      },
      body: {},
      query: {},
      session: {
        changedConditionsInputs: ['code 1', 'code 2'],
        changedConditionsInputsCounter: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        licence: {
          id: '1',
          version: 'version',
          additionalLicenceConditions: [
            { id: '1', code: 'code 1' },
            { id: '2', code: 'code 2' },
          ],
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('sets the changedConditionsInputsCounter to the integer equivalent of req params change counter', async () => {
      req.params.changeCounter = '2'
      req.session.changedConditionsInputsCounter = 1
      await handler.GET(req, res)
      expect(req.session.changedConditionsInputsCounter).toEqual(2)
    })

    it('redirects back to the parent condition if the input counter is 0', async () => {
      req.params.changeCounter = '0'
      req.session.changedConditionsCounter = 1
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes/condition/1')
    })

    it('redirects to the policy changes callback if the counter is greater than number of inputs', async () => {
      req.params.changeCounter = '4'
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes/callback')
    })

    it('redirects to the relevant condition page for AP conditions', async () => {
      conditionService.getAdditionalConditionType.mockResolvedValue(LicenceType.AP)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/condition/1?fromPolicyReview=true'
      )
    })

    it('redirects to the relevant condition page for AP conditions', async () => {
      conditionService.getAdditionalConditionType.mockResolvedValue(LicenceType.PSS)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-pss-conditions/condition/1?fromPolicyReview=true'
      )
    })
  })
})
