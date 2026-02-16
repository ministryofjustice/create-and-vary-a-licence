import { Request, Response } from 'express'

import LicenceService from '../../../../services/licenceService'
import ConfirmCreateRoutes from './confirmCreate'
import { LicenceSummary, PrisonerWithCvlFields } from '../../../../@types/licenceApiClientTypes'
import ProbationService from '../../../../services/probationService'
import PrisonerService from '../../../../services/prisonerService'
import config from '../../../../config'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const probationService = new ProbationService(null) as jest.Mocked<ProbationService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

jest.mock('../../../../services/licenceService')
jest.mock('../../../../services/probationService')
jest.mock('../../../../services/prisonerService')

describe('Route Handlers - Create Licence - Confirm Create', () => {
  const handler = new ConfirmCreateRoutes(probationService, licenceService, prisonerService)
  let req: Request
  let res: Response

  const existingConfig = config

  beforeEach(() => {
    config.hdcEnabled = false
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
        firstName: 'TEST',
        lastName: 'PERSON',
        confirmedReleaseDate: '2024-07-19',
        conditionalReleaseDate: '2022-09-01',
        homeDetentionCurfewActualDate: '2024-07-19',
        homeDetentionCurfewEligibilityDate: '2024-07-19',
        dateOfBirth: '1992-12-06',
      },
      cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
    } as PrisonerWithCvlFields
    licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
    prisonerService.isHdcApproved.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
    config.hdcEnabled = existingConfig.hdcEnabled
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/hdc/confirmCreate', {
        licence: {
          licenceStartDate: '18/07/2024',
          dateOfBirth: '06/12/1992',
          forename: 'Test',
          surname: 'Person',
        },
        backLink: req.session?.returnToCase,
      })
    })

    it('should redirect to access-denied if hdc licence block is enabled', async () => {
      config.hdcEnabled = true
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
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access-denied if the licence is in the hard stop period', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: true, licenceStartDate: '18/07/2024' },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case is not approved for HDC', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(false)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCAD', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: null,
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(true)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCED', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: null,
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false, licenceStartDate: '18/07/2024' },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(true)
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })
  })

  describe('POST', () => {
    it('should create an hdc licence and should redirect', async () => {
      licenceService.createProbationLicence.mockResolvedValue({ licenceId: 1, kind: 'HDC' } as LicenceSummary)
      await handler.POST(req, res)
      expect(licenceService.createProbationLicence).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-name')
    })

    it('should redirect to access-denied if the licence is in the hard stop period', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: true },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case is not approved for HDC', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: '2024-07-19',
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      prisonerService.isHdcApproved.mockResolvedValue(false)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCAD', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: null,
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access denied if the case does not have an HDCED', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          homeDetentionCurfewActualDate: '2024-07-19',
          homeDetentionCurfewEligibilityDate: null,
          dateOfBirth: '1992-12-06',
        },
        cvl: { isInHardStopPeriod: false },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })
  })
})
