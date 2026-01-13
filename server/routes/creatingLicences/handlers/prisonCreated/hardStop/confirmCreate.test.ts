import { Request, Response } from 'express'
import { Session } from 'express-session'

import LicenceService from '../../../../../services/licenceService'
import ConfirmCreateRoutes from './confirmCreate'
import { LicenceSummary, PrisonerWithCvlFields } from '../../../../../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

jest.mock('../../../../../services/licenceService')

describe('Route Handlers - Create Licence - Confirm Create', () => {
  const handler = new ConfirmCreateRoutes(licenceService)
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
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render view', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'TEST',
          lastName: 'PERSON',
          confirmedReleaseDate: '2024-07-19',
          conditionalReleaseDate: '2022-09-01',
          dateOfBirth: '1992-12-06',
        },
        cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null, licenceStartDate: '18/07/2024' },
      } as PrisonerWithCvlFields
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/prisonCreated/hardStop/confirmCreate', {
        licence: {
          nomsId: 'ABC123',
          licenceStartDate: '18/07/2024',
          dateOfBirth: '06/12/1992',
          forename: 'Test',
          surname: 'Person',
          licenceType: 'AP',
        },
        backLink: req.session?.returnToCase,
      })
    })
  })

  describe('POST', () => {
    it('should create hardstop licence and should redirect if answer is YES', async () => {
      req.body.answer = 'Yes'
      licenceService.createPrisonLicence.mockResolvedValue({ licenceId: 1 })
      await handler.POST(req, res)
      expect(licenceService.createPrisonLicence).toHaveBeenCalledWith('ABC123', {
        username: 'joebloggs',
      })
      expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-name')
    })

    it('should not create licence and should redirect when answer is NO', async () => {
      req.body.answer = 'No'
      await handler.POST(req, res)
      expect(licenceService.createPrisonLicence).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(req.session.returnToCase)
    })

    it('should not create licence and should redirect when answer is NO when no session', async () => {
      req.body.answer = 'No'
      req.session = {} as Session
      await handler.POST(req, res)
      expect(licenceService.createPrisonLicence).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
    })
  })
})
