import { Request, Response } from 'express'

import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import { LicenceAndResponsibleCom } from '../../../@types/managedCase'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>

const fakeSummary = {
  licenceId: 1,
  licenceType: 'AP',
  surname: 'Smith',
  forename: 'Bob',
  nomisId: 'A1234AA',
  licenceStatus: LicenceStatus.SUBMITTED,
  prisonDescription: 'Moorland (HMP)',
  conditionalReleaseDate: '01/02/2022',
  comFirstName: 'Joe',
  comLastName: 'Rogan',
}

const fakeSummaryList = [fakeSummary] as LicenceAndResponsibleCom[]

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response

    caseloadService.getOmuCaseload = jest.fn()
  })

  describe('GET', () => {
    it('should render list of licences', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(fakeSummaryList)

      await handler.GET(req, res)

      expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith({ username: 'joebloggs' })
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', { cases: fakeSummaryList, statusConfig })
    })
  })
})
