import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'
import PolicyChangeRoutes from './policyChange'
import { Licence, LicenceConditionChange } from '../../../@types/licenceApiClientTypes'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, conditionService) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('Route handlers', () => {
  const handler = new PolicyChangeRoutes(licenceService, conditionService)
  let req: Request
  let res: Response

  licenceService.getParentLicenceOrSelf.mockResolvedValue({ id: 1, version: 'version', typeCode: 'AP_PSS' } as Licence)

  let condition1 = {
    changeType: 'DELETED',
    code: 'code1',
    sequence: 1,
    previousText: 'Condition 1 text',
    dataChanges: [],
    suggestions: [{ code: 'code 5' }],
  } as LicenceConditionChange

  const condition2 = {
    changeType: 'TEXT_CHANGE',
    code: 'code2',
    sequence: 2,
    previousText: 'Condition 2 previous text',
    currentText: 'Condition 2 current text',
    dataChanges: [],
    suggestions: [],
  } as LicenceConditionChange

  const condition3 = {
    changeType: 'NEW_OPTIONS',
    code: 'code3',
    sequence: 3,
    previousText: 'Condition 3 previous text',
    currentText: 'Condition 3 current text',
    dataChanges: [],
    suggestions: [],
  } as LicenceConditionChange

  const condition4 = {
    changeType: 'REPLACED',
    code: 'code4',
    sequence: 4,
    previousText: 'Condition 4 text',
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
        changedConditions: [condition1, condition2, condition3, condition4],
        changedConditionsCounter: '2',
        changedConditionInputs: [],
      },
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
    it('should update req.session.changeConditionsCounter counter to req.params.changeCounter', async () => {
      await handler.GET(req, res)
      expect(req.session.changedConditionsCounter).toEqual(1)
    })

    it('should redirect back to the policy change screen if the param counter is 0', async () => {
      req.params.changeCounter = '0'
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes')
    })

    describe('page rendering', () => {
      it('should redirect to the deleted condition page when the condition change type is DELETED', async () => {
        const condition = { code: 'code5', text: 'Conditon 5', category: 'group1', requiresInput: false }
        conditionService.getAdditionalConditionByCode.mockResolvedValue(condition)
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/vary/policyConditionDeleted', {
          condition: condition1,
          conditionCounter: 1,
          conditionHintText: undefined,
          licenceId: '1',
          policyChangesCount: 4,
          replacements: [condition],
        })
      })

      it('should redirect to the text change page when the condition change type is TEXT_CHANGE', async () => {
        req.params.changeCounter = '2'
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/vary/policyTextChange', {
          condition: condition2,
          conditionCounter: 2,
          conditionHintText: undefined,
          licenceId: '1',
          policyChangesCount: 4,
        })
      })

      it('should redirect to the new options page when the condition change type is NEW_OPTIONS', async () => {
        req.params.changeCounter = '3'
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/vary/policyNewOptions', {
          condition: condition3,
          conditionCounter: 3,
          conditionHintText: undefined,
          licenceId: '1',
          policyChangesCount: 4,
        })
      })

      it('should redirect to the replaced condition page when the condition change type is REPLACED', async () => {
        const condition = { code: 'code6', text: 'Conditon 6', category: 'group1', requiresInput: false }
        conditionService.getAdditionalConditionByCode.mockResolvedValue(condition)
        req.params.changeCounter = '4'
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/vary/policyConditionReplaced', {
          condition: condition4,
          conditionCounter: 4,
          conditionHintText: undefined,
          licenceId: '1',
          policyChangesCount: 4,
          replacements: [condition],
        })
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the policyChangesInputCallback', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes/input/callback/1')
    })

    it('sets the changeConditionInputs in session storage', async () => {
      req.body.additionalConditions = ['code 5', 'code 7']
      condition1 = { ...condition1, suggestions: [{ code: 'code 5' }, { code: 'code 7' }] } as LicenceConditionChange
      const newCondition1 = { code: 'code 5', text: 'Conditon 5', category: 'group1', requiresInput: true }
      const newCondition2 = { code: 'code 7', text: 'Conditon 7', category: 'group1', requiresInput: true }
      conditionService.getAdditionalConditionByCode.mockResolvedValueOnce(newCondition1)
      conditionService.getAdditionalConditionByCode.mockResolvedValueOnce(newCondition2)
      await handler.POST(req, res)

      expect(req.session.changedConditionsInputs).toEqual(['code 5', 'code 7'])
    })

    it('updates the additional licence conditions', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditions).toHaveBeenCalled()
    })
  })

  describe('formatVersionNumber', () => {
    it('formats a given float to a vX_Y format', () => {
      expect(handler.formatVersionNumber('2.0')).toEqual('v2_0')
    })
  })
})
