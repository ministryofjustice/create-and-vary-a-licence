import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import ConfirmCreateRoutes from './confirmCreate'
import ProbationService from '../../../services/probationService'
import { CvlPrisoner, LicenceSummary, PrisonerWithCvlFields } from '../../../@types/licenceApiClientTypes'
import logger from '../../../../logger'
import { LicenceKind } from '../../../enumeration'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const probationService = new ProbationService(null) as jest.Mocked<ProbationService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/probationService')
jest.mock('../../../services/prisonerService')
jest.mock('../../../../logger')

describe('Route Handlers - Create Licence - Confirm Create', () => {
  const handler = new ConfirmCreateRoutes(probationService, licenceService)
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

    licenceService.getPrisonerDetail.mockResolvedValue({
      prisoner: {
        confirmedReleaseDate: '2022-11-20',
        conditionalReleaseDate: '2022-11-21',
        dateOfBirth: '1960-11-10',
        firstName: 'Test',
        lastName: 'Person',
      } as CvlPrisoner,
      cvl: {
        isInHardStopPeriod: false,
        isEligibleForEarlyRelease: true,
        licenceStartDate: '19/11/2022',
        licenceKind: LicenceKind.CRD,
      },
    } as PrisonerWithCvlFields)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    beforeEach(() => {
      probationService.getProbationer.mockResolvedValue({
        crn: 'X1234',
      })
    })

    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmCreate', {
        licence: {
          licenceStartDate: '19/11/2022',
          crn: 'X1234',
          dateOfBirth: '10/11/1960',
          forename: 'Test',
          surname: 'Person',
          isEligibleForEarlyRelease: true,
          kind: LicenceKind.CRD,
        },
        backLink: req.session.returnToCase,
      })
    })

    it('should render default return to caseload link if no session state', async () => {
      const reqWithEmptySession = {
        params: {
          licenceId: '1',
        },
        session: {},
        flash: jest.fn(),
      } as unknown as Request

      await handler.GET(reqWithEmptySession, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmCreate', {
        licence: {
          licenceStartDate: '19/11/2022',
          crn: 'X1234',
          dateOfBirth: '10/11/1960',
          forename: 'Test',
          surname: 'Person',
          isEligibleForEarlyRelease: true,
          kind: LicenceKind.CRD,
        },
        backLink: '/licence/create/caseload',
      })
    })

    it('should redirect to access-denied if called during the hard stop period', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue({
        prisoner: {
          confirmedReleaseDate: '2022-11-20',
          conditionalReleaseDate: '2022-11-21',
          dateOfBirth: '1960-11-10',
          firstName: 'Test',
          lastName: 'Person',
        } as CvlPrisoner,
        cvl: {
          isInHardStopPeriod: true,
          isEligibleForEarlyRelease: true,
          licenceStartDate: '19/11/2022',
          licenceKind: LicenceKind.CRD,
        },
      } as PrisonerWithCvlFields)

      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      expect(logger.error).toHaveBeenCalledWith(
        'Access denied to PP licence creation GET due to being in hard stop period',
      )
    })
  })

  describe('POST', () => {
    it('should create licence and should redirect', async () => {
      licenceService.createLicence.mockResolvedValue({ licenceId: 1 } as LicenceSummary)
      await handler.POST(req, res)
      expect(licenceService.createLicence).toHaveBeenCalledWith(
        { nomsId: 'ABC123', type: 'CRD' },
        {
          username: 'joebloggs',
        },
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-name')
    })

    it('should redirect to access-denied if called during the hard stop period', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue({
        prisoner: {
          confirmedReleaseDate: '2022-11-20',
          conditionalReleaseDate: '2022-11-21',
          dateOfBirth: '1960-11-10',
          firstName: 'Test',
          lastName: 'Person',
        } as CvlPrisoner,
        cvl: {
          isInHardStopPeriod: true,
          isEligibleForEarlyRelease: true,
          licenceStartDate: '19/11/2022',
          licenceKind: LicenceKind.CRD,
        },
      } as PrisonerWithCvlFields)

      await handler.POST(req, res)
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      expect(logger.error).toHaveBeenCalledWith(
        'Access denied to PP licence creation POST due to being in hard stop period',
      )
    })
  })
})
