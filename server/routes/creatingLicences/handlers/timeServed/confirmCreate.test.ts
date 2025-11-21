import { Request, Response } from 'express'
import { Session } from 'express-session'

import LicenceService from '../../../../services/licenceService'
import ConfirmCreateRoutes from './confirmCreate'
import {
  LicenceSummary,
  PrisonerWithCvlFields,
  ExternalTimeServedRecordResponse,
} from '../../../../@types/licenceApiClientTypes'
import TimeServedService from '../../../../services/timeServedService'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const timeServedExternalRecordService = new TimeServedService(null) as jest.Mocked<TimeServedService>

jest.mock('../../../../services/licenceService')
jest.mock('../../../../services/timeServedService')

describe('Route Handlers - Create Time Served Licence - Confirm Create', () => {
  const handler = new ConfirmCreateRoutes(licenceService, timeServedExternalRecordService)
  let req: Request
  let res: Response

  const prisonerDetails = {
    prisoner: {
      prisonerNumber: 'A1234BC',
      firstName: 'TEST',
      lastName: 'PERSON',
      confirmedReleaseDate: '2024-07-19',
      conditionalReleaseDate: '2022-09-01',
      dateOfBirth: '1992-12-06',
      bookingId: '12345',
      prisonId: 'MDI',
    },
    cvl: {
      licenceType: 'AP',
      hardStopDate: '17/07/2024',
      hardStopWarningDate: '17/07/2024',
      licenceStartDate: '18/07/2024',
      licenceKind: 'HARD_STOP',
    },
  } as PrisonerWithCvlFields

  const existingTimeServedExternalRecord = {
    nomsId: 'A1234BC',
    bookingId: 12345,
    reason: 'A reason for using NOMIS',
    prisonCode: 'MDI',
    dateCreated: '2024-07-01T10:00:00Z',
    dateLastUpdated: '2024-07-01T10:00:00Z',
  } as ExternalTimeServedRecordResponse

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
      flash: jest.fn(),
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
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render view confirm create', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      timeServedExternalRecordService.getTimeServedExternalRecord.mockResolvedValue(null)
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/prisonCreated/timeServed/confirmCreate', {
        licence: {
          nomsId: 'ABC123',
          licenceStartDate: '18/07/2024',
          dateOfBirth: '06/12/1992',
          forename: 'Test',
          surname: 'Person',
          licenceType: 'AP',
          isEligibleForEarlyRelease: undefined,
          kind: 'HARD_STOP',
        },
        backLink: req.session?.returnToCase,
        existingTimeServedExternalRecord: null,
      })
    })

    it('should render view confirm create with existing reason', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      timeServedExternalRecordService.getTimeServedExternalRecord.mockResolvedValue(existingTimeServedExternalRecord)
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/prisonCreated/timeServed/confirmCreate', {
        licence: {
          nomsId: 'ABC123',
          licenceStartDate: '18/07/2024',
          dateOfBirth: '06/12/1992',
          forename: 'Test',
          surname: 'Person',
          licenceType: 'AP',
          isEligibleForEarlyRelease: undefined,
          kind: 'HARD_STOP',
        },
        backLink: req.session?.returnToCase,
        existingTimeServedExternalRecord,
      })
    })
  })

  describe('POST', () => {
    it('should create time served licence and should redirect if answer is YES', async () => {
      req.body.answer = 'Yes'
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      licenceService.createLicence.mockResolvedValue({ licenceId: 1, kind: 'HARD_STOP' } as LicenceSummary)

      await handler.POST(req, res)

      expect(licenceService.getPrisonerDetail).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(licenceService.createLicence).toHaveBeenCalledWith(
        { nomsId: 'ABC123', type: 'HARD_STOP' },
        {
          username: 'joebloggs',
        },
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/create/id/1/initial-meeting-name')
      expect(timeServedExternalRecordService.updateTimeServedExternalRecord).not.toHaveBeenCalled()
    })

    it('should not create a licence, record reason and redirect when answer is NO and there is no existing reason', async () => {
      req.body.answer = 'No'
      req.body.reasonForUsingNomis = 'Test reason for using NOMIS'

      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      timeServedExternalRecordService.getTimeServedExternalRecord.mockResolvedValue(null)
      timeServedExternalRecordService.updateTimeServedExternalRecord.mockResolvedValue(undefined)

      await handler.POST(req, res)

      expect(licenceService.getPrisonerDetail).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(timeServedExternalRecordService.updateTimeServedExternalRecord).toHaveBeenCalledWith(
        'ABC123',
        12345,
        {
          reason: 'Test reason for using NOMIS',
          prisonCode: 'MDI',
        },
        {
          username: 'joebloggs',
        },
      )
      expect(res.redirect).toHaveBeenCalledWith(req.session.returnToCase)
    })

    it('should not create a licence, update reason and redirect when answer is NO and there is an existing reason', async () => {
      req.body.answer = 'No'
      req.body.reasonForUsingNomis = 'Another reason for using NOMIS'

      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      timeServedExternalRecordService.getTimeServedExternalRecord.mockResolvedValue(existingTimeServedExternalRecord)
      timeServedExternalRecordService.updateTimeServedExternalRecord.mockResolvedValue(undefined)

      await handler.POST(req, res)

      expect(licenceService.getPrisonerDetail).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(timeServedExternalRecordService.updateTimeServedExternalRecord).toHaveBeenCalledWith(
        'ABC123',
        12345,
        {
          reason: 'Another reason for using NOMIS',
          prisonCode: 'MDI',
        },
        {
          username: 'joebloggs',
        },
      )
      expect(res.redirect).toHaveBeenCalledWith(req.session.returnToCase)
    })

    it('should not create licence and should redirect when answer is NO when no session', async () => {
      req.body.answer = 'No'
      req.body.reasonForUsingNomis = 'Test reason'
      req.session = {} as Session

      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      timeServedExternalRecordService.getTimeServedExternalRecord.mockResolvedValue(null)
      timeServedExternalRecordService.updateTimeServedExternalRecord.mockResolvedValue(undefined)

      await handler.POST(req, res)

      expect(licenceService.getPrisonerDetail).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(timeServedExternalRecordService.updateTimeServedExternalRecord).toHaveBeenCalledWith(
        'ABC123',
        12345,
        {
          reason: 'Test reason',
          prisonCode: 'MDI',
        },
        {
          username: 'joebloggs',
        },
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
    })
  })
})
