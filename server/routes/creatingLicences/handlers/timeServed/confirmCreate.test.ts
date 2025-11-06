import { Request, Response } from 'express'
import { Session } from 'express-session'

import LicenceService from '../../../../services/licenceService'
import RecordNomisTimeServedLicenceReasonService from '../../../../services/recordNomisTimeServedLicenceReasonService'
import ConfirmCreateRoutes from './confirmCreate'
import { LicenceSummary, PrisonerWithCvlFields } from '../../../../@types/licenceApiClientTypes'

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
      })
    })
  })

  describe('POST', () => {
    const prisonerDetails = {
      prisoner: {
        prisonerNumber: 'A1234BC',
        firstName: 'TEST',
        lastName: 'PERSON',
        dateOfBirth: '1992-12-06',
        bookingId: '12345',
        prisonId: 'MDI',
      },
      cvl: {
        licenceType: 'AP',
        licenceStartDate: '18/07/2024',
      },
    } as PrisonerWithCvlFields

    beforeEach(() => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
    })

    it('should create time served licence and should redirect if answer is YES', async () => {
      req.body.answer = 'Yes'
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

    it('should not create a licence, record reason and redirect when answer is NO', async () => {
      req.body.answer = 'No'
      req.body.reasonForUsingNomis = 'Test reason for using NOMIS'

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

    it('should not create licence and should redirect when answer is NO when no session', async () => {
      req.body.answer = 'No'
      req.body.reasonForUsingNomis = 'Test reason'
      req.session = {} as Session

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
