import { Request, Response } from 'express'
import ChangeLocationRoutes from './changeLocation'
import UserService from '../../../services/userService'
import { PrisonApiCaseload } from '../../../@types/prisonApiClientTypes'

const userService = new UserService(null, null, null) as jest.Mocked<UserService>
jest.mock('../../../services/userService')

describe('Route Handlers - ChangeLocationRoutes', () => {
  const handler = new ChangeLocationRoutes(userService)
  let req: Request
  let res: Response

  const caseloadsFromNomis = [
    {
      caseLoadId: 'BAI',
      description: 'Belmarsh (HMP)',
      type: 'INST',
      caseloadFunction: 'GENERAL',
      currentlyActive: true,
    },
    {
      caseLoadId: 'BMI',
      description: 'Birmingham (HMP)',
      type: 'INST',
      caseloadFunction: 'GENERAL',
      currentlyActive: false,
    },
    {
      caseLoadId: 'BXI',
      description: 'Brixton (HMP)',
      type: 'INST',
      caseloadFunction: 'GENERAL',
      currentlyActive: false,
    },
    {
      caseLoadId: 'MDI',
      description: 'Moorland (HMP & YOI)',
      type: 'INST',
      caseloadFunction: 'GENERAL',
      currentlyActive: false,
    },
  ] as PrisonApiCaseload[]

  beforeEach(() => {
    res = {
      locals: { user: {} },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    req = {
      session: { caseloadsSelected: [] },
      body: { caseload: [] },
    } as unknown as Request
  })

  describe('GET', () => {
    it('Should render page with all users caseloads in Nomis', async () => {
      userService.getPrisonUserCaseloads.mockResolvedValue(caseloadsFromNomis)

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/changeLocation', {
        caseload: [
          { text: 'Belmarsh (HMP)', value: 'BAI' },
          { text: 'Birmingham (HMP)', value: 'BMI' },
          { text: 'Brixton (HMP)', value: 'BXI' },
          { text: 'Moorland (HMP & YOI)', value: 'MDI' },
        ],
        checked: [],
      })
    })
  })

  describe('POST', () => {
    it('Should redirect to caselist page', async () => {
      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
    })
  })
})
