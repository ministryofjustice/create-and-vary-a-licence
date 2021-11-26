import { Request, Response } from 'express'

import ViewAndPrintCaseRoutes from './viewCases'
import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const username = 'joebloggs'
const fakeSummary = {
  licenceId: 1,
  licenceType: 'AP',
  surname: 'Smith',
  forename: 'Bob',
  nomisId: 'A1234AA',
  licenceStatus: LicenceStatus.SUBMITTED,
  prisonDescription: 'Moorland (HMP)',
  conditionalReleaseDate: '01/02/2022',
}

const fakeSummaryList = [fakeSummary] as LicenceSummary[]

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    licenceService.getLicencesForCaseAdmin = jest.fn()
  })

  describe('GET', () => {
    it('should render list of licences for a prison user', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username,
            prisonCaseload: ['MDI', 'LEI', 'BMI'],
            authSource: 'nomis',
          },
        },
      } as unknown as Response

      licenceService.getLicencesForCaseAdmin.mockResolvedValue(fakeSummaryList)
      await handler.GET(req, res)
      const { authSource, prisonCaseload, deliusStaffIdentifier: staffId } = res.locals.user
      expect(licenceService.getLicencesForCaseAdmin).toHaveBeenCalledWith(username, authSource, prisonCaseload, staffId)
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', { cases: fakeSummaryList, statusConfig })
    })

    it('should render list of licences for a probation user', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username,
            prisonCaseload: [],
            authSource: 'delius',
            deliusStaffIdentifier: 123,
          },
        },
      } as unknown as Response

      licenceService.getLicencesForCaseAdmin.mockResolvedValue(fakeSummaryList)
      await handler.GET(req, res)
      const { authSource, prisonCaseload, deliusStaffIdentifier: staffId } = res.locals.user
      expect(licenceService.getLicencesForCaseAdmin).toHaveBeenCalledWith(username, authSource, prisonCaseload, staffId)
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', { cases: fakeSummaryList, statusConfig })
    })

    it('should render an empty list for an auth user', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username,
            prisonCaseload: [],
            authSource: 'auth',
          },
        },
      } as unknown as Response

      licenceService.getLicencesForCaseAdmin.mockResolvedValue([])
      await handler.GET(req, res)
      const { authSource, prisonCaseload, deliusStaffIdentifier: staffId } = res.locals.user
      expect(licenceService.getLicencesForCaseAdmin).toHaveBeenCalledWith(username, authSource, prisonCaseload, staffId)
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', { cases: [], statusConfig })
    })
  })

  describe('POST', () => {
    it('should select a licence to view', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
    })
  })
})
