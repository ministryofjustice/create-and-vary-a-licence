import { Request, Response, NextFunction } from 'express'
import ChangeLocationRoutes from './changeLocation'
import UserService from '../../../services/userService'
import { PrisonApiCaseload } from '../../../@types/prisonApiClientTypes'
import AuthRole from '../../../enumeration/authRole'

const userService = new UserService(null, null, null) as jest.Mocked<UserService>
jest.mock('../../../services/userService')

describe('Route Handlers - ChangeLocationRoutes', () => {
  const handler = new ChangeLocationRoutes(userService)
  let req: Request
  let res: Response
  let next: NextFunction
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
      query: {},
    } as unknown as Request
  })

  describe('GET', () => {
    it('Should render page with all users caseloads in Nomis, for prison view', async () => {
      userService.getPrisonUserCaseloads.mockResolvedValue(caseloadsFromNomis)
      await handler.GET(AuthRole.CASE_ADMIN)(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/changeLocation', {
        caseload: [
          { text: 'Belmarsh (HMP)', value: 'BAI' },
          { text: 'Birmingham (HMP)', value: 'BMI' },
          { text: 'Brixton (HMP)', value: 'BXI' },
          { text: 'Moorland (HMP & YOI)', value: 'MDI' },
        ],
        checked: [],
        cancelLink: '/licence/view/cases',
      })
    })
    it('Should render page with all users caseloads in Nomis, for probation view', async () => {
      userService.getPrisonUserCaseloads.mockResolvedValue(caseloadsFromNomis)
      req.query.view = 'probation'
      await handler.GET(AuthRole.CASE_ADMIN)(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/changeLocation', {
        caseload: [
          { text: 'Belmarsh (HMP)', value: 'BAI' },
          { text: 'Birmingham (HMP)', value: 'BMI' },
          { text: 'Brixton (HMP)', value: 'BXI' },
          { text: 'Moorland (HMP & YOI)', value: 'MDI' },
        ],
        checked: [],
        cancelLink: '/licence/view/cases?view=probation',
      })
    })
    it('Should render cancel link for approve cases page for approver users', async () => {
      userService.getPrisonUserCaseloads.mockResolvedValue(caseloadsFromNomis)
      await handler.GET(AuthRole.DECISION_MAKER)(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/changeLocation', {
        caseload: [
          { text: 'Belmarsh (HMP)', value: 'BAI' },
          { text: 'Birmingham (HMP)', value: 'BMI' },
          { text: 'Brixton (HMP)', value: 'BXI' },
          { text: 'Moorland (HMP & YOI)', value: 'MDI' },
        ],
        checked: [],
        cancelLink: '/licence/approve/cases',
      })
    })
    it('Should render cancel link with approval param', async () => {
      userService.getPrisonUserCaseloads.mockResolvedValue(caseloadsFromNomis)
      req.query.approval = 'recently'
      await handler.GET(AuthRole.DECISION_MAKER)(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/changeLocation', {
        caseload: [
          { text: 'Belmarsh (HMP)', value: 'BAI' },
          { text: 'Birmingham (HMP)', value: 'BMI' },
          { text: 'Brixton (HMP)', value: 'BXI' },
          { text: 'Moorland (HMP & YOI)', value: 'MDI' },
        ],
        checked: [],
        cancelLink: '/licence/approve/cases?approval=recently',
      })
    })
  })

  describe('POST', () => {
    it('Should redirect to caselist page for prison view', async () => {
      await handler.POST(AuthRole.CASE_ADMIN)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
    })

    it('Should redirect to caselist page for probation view', async () => {
      req.query.view = 'probation'
      await handler.POST(AuthRole.CASE_ADMIN)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases?view=probation')
    })
  })
})
