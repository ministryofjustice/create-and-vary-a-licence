import { Request, Response } from 'express'
import { LicenceConditionChange } from '../../../@types/licenceApiClientTypes'
import PolicyConfirmDeleteRoutes from './policyConfirmDelete'

describe('Route handlers', () => {
  const handler = new PolicyConfirmDeleteRoutes()
  let req: Request
  let res: Response

  const condition = {
    changeType: 'TEXT_CHANGE',
    code: 'code1',
    sequence: 1,
    previousText: 'Condition 1 previous text',
    currentText: 'Condition 1 current text',
    dataChanges: [],
    suggestions: [],
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
        changedConditions: [condition],
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  it('renders the confirm deletion page for the given condition', async () => {
    await handler.GET(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/vary/policyConfirmDelete', {
      licenceId: '1',
      changeCounter: '1',
      conditionText: condition.previousText,
    })
  })
})
