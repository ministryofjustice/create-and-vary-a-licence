import { Request, Response } from 'express'
import { Session } from 'express-session'

import LicenceService from '../../../../services/licenceService'
import ConfirmCreateRoutes from './confirmCreate'
import { CaseloadItem, LicenceSummary } from '../../../../@types/licenceApiClientTypes'
import ProbationService from '../../../../services/probationService'
import PrisonerService from '../../../../services/prisonerService'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const probationService = new ProbationService(null, null) as jest.Mocked<ProbationService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

jest.mock('../../../../services/licenceService')
jest.mock('../../../../services/probationService')
jest.mock('../../../../services/prisonerService')

describe('Route Handlers - Create Licence - Confirm Create', () => {
  const handler = new ConfirmCreateRoutes(probationService, licenceService, prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        answer: null,
      },
      params: {
        nomisId: 'ABC123',
      },
      session: {
        returnToCase: 'some-back-link',
      },
      user: {
        username: 'joebloggs',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response

    const prisonerDetails = {
      prisoner: {
        prisonerNumber: 'G4169UO',
        firstName: 'EMAJINHANY',
        lastName: 'ELYSASHA',
        confirmedReleaseDate: '2024-07-19',
        conditionalReleaseDate: '2022-09-01',
        homeDetentionCurfewActualDate: '2024-07-19',
        homeDetentionCurfewEligibilityDate: '2024-07-19',
        dateOfBirth: '1992-12-06',
      },
      cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
    } as CaseloadItem
    licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
    prisonerService.isHdcApproved.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/hdc/confirmCreate', {
        licence: {
          licenceStartDate: '18/07/2024',
          dateOfBirth: '06/12/1992',
          forename: 'Emajinhany',
          surname: 'Elysasha',
        },
        backLink: req.session?.returnToCase,
      })
    })

    it('should redirect to access-denied if the licence is in the hard stop period', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: true, licenceStartDate: '18/07/2024' },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case is not approved for HDC', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(false)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCAD', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: null,
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(true)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCED', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: null,
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(true)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })
  })

  describe('POST', () => {
    it('should create an hdc licence and should redirect if answer is YES', async () => {
      req.body.answer = 'Yes'
      licenceService.createLicence.mockResolvedValue({ licenceId: 1, kind: 'HDC' } as LicenceSummary)
      await handler.POST(req, res)
      expect(licenceService.createLicence).toHaveBeenCalledWith(
        { nomsId: 'ABC123', type: 'HDC' },
        {
          username: 'joebloggs',
        },
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-name')
    })

    it('should not create licence and should redirect when answer is NO', async () => {
      req.body.answer = 'No'
      await handler.POST(req, res)
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(req.session.returnToCase)
    })

    it('should not create licence and should redirect when answer is NO when no session', async () => {
      req.body.answer = 'No'
      req.session = {} as Session
      await handler.POST(req, res)
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/')
    })

    it('should redirect to access-denied if the licence is in the hard stop period', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: true },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case is not approved for HDC', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(false)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCAD', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: null,
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCED', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: null,
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false },
      } as CaseloadItem
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })
  })
})
