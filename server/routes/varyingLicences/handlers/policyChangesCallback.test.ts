import { Request, Response } from 'express'
import { LicenceConditionChange } from '../../../@types/licenceApiClientTypes'
import PolicyChangesCallbackRoutes from './policyChangesCallback'

describe('Route handlers', () => {
  const handler = new PolicyChangesCallbackRoutes()
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

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: {},
      query: {},
      session: {
        changedConditions: [condition3, condition1, condition2],
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
    it('redirects to the next policy change', async () => {
      req.session.changedConditionsCounter = 0
      await handler.GET(req, res)
      expect(req.session.changedConditionsCounter).toEqual(1)
      expect(res.redirect).toHaveBeenCalledWith(`/licence/vary/id/1/policy-changes/condition/1`)
    })

    it('redirects to the check-your-answers page if all of the changed conditions have been reviewed', async () => {
      req.session.changedConditionsCounter = 3
      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
