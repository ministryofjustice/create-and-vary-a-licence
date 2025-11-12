import { Request, Response } from 'express'
import { Session } from 'express-session'

import LicenceService from '../../../../services/licenceService'
import RecordNomisTimeServedLicenceReasonService from '../../../../services/recordNomisTimeServedLicenceReasonService'
import ConfirmCreateRoutes from './confirmCreate'
import {
  LicenceSummary,
  PrisonerWithCvlFields,
  RecordNomisLicenceReasonResponse,
} from '../../../../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const recordNomisTimeServedLicenceReasonService = new RecordNomisTimeServedLicenceReasonService(
  null,
) as jest.Mocked<RecordNomisTimeServedLicenceReasonService>

jest.mock('../../../../services/licenceService')
jest.mock('../../../../services/recordNomisTimeServedLicenceReasonService')

describe('Route Handlers - Create Time Served Licence - Confirm Create', () => {
  const handler = new ConfirmCreateRoutes(licenceService, recordNomisTimeServedLicenceReasonService)
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

  const existingNomisLicenceCreationReason = {
    nomsId: 'A1234BC',
    bookingId: 12345,
    reason: 'A reason for using NOMIS',
    prisonCode: 'MDI',
  } as RecordNomisLicenceReasonResponse

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
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render view confirm create', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      recordNomisTimeServedLicenceReasonService.getExistingNomisLicenceCreationReason.mockResolvedValue(null)
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/timeServed/confirmCreate', {
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
        existingNomisLicenceCreationReason: null,
      })
    })

    it('should render view confirm create with existing reason', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      recordNomisTimeServedLicenceReasonService.getExistingNomisLicenceCreationReason.mockResolvedValue(
        existingNomisLicenceCreationReason,
      )
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/timeServed/confirmCreate', {
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
        existingNomisLicenceCreationReason,
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
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
      expect(recordNomisTimeServedLicenceReasonService.recordNomisLicenceCreationReason).not.toHaveBeenCalled()
    })

    it('should not create a licence, record reason and redirect when answer is NO and there is no existing reason', async () => {
      req.body.answer = 'No'
      req.body.reasonForUsingNomis = 'Test reason for using NOMIS'

      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      recordNomisTimeServedLicenceReasonService.getExistingNomisLicenceCreationReason.mockResolvedValue(null)
      recordNomisTimeServedLicenceReasonService.recordNomisLicenceCreationReason.mockResolvedValue(undefined)

      await handler.POST(req, res)

      expect(licenceService.getPrisonerDetail).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(recordNomisTimeServedLicenceReasonService.recordNomisLicenceCreationReason).toHaveBeenCalledWith(
        {
          nomsId: 'ABC123',
          bookingId: 12345,
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
      recordNomisTimeServedLicenceReasonService.getExistingNomisLicenceCreationReason.mockResolvedValue(
        existingNomisLicenceCreationReason,
      )
      recordNomisTimeServedLicenceReasonService.updateNomisLicenceCreationReason.mockResolvedValue(undefined)

      await handler.POST(req, res)

      expect(licenceService.getPrisonerDetail).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(recordNomisTimeServedLicenceReasonService.updateNomisLicenceCreationReason).toHaveBeenCalledWith(
        'ABC123',
        12345,
        {
          reason: 'Another reason for using NOMIS',
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
      recordNomisTimeServedLicenceReasonService.getExistingNomisLicenceCreationReason.mockResolvedValue(null)
      recordNomisTimeServedLicenceReasonService.recordNomisLicenceCreationReason.mockResolvedValue(undefined)

      await handler.POST(req, res)

      expect(licenceService.getPrisonerDetail).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(licenceService.createLicence).not.toHaveBeenCalled()
      expect(recordNomisTimeServedLicenceReasonService.recordNomisLicenceCreationReason).toHaveBeenCalledWith(
        {
          nomsId: 'ABC123',
          bookingId: 12345,
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
