import { Request, Response } from 'express'

import LicenceService from '../../../../../services/licenceService'
import { PrisonerWithCvlFields } from '../../../../../@types/licenceApiClientTypes'
import NDeliusRecordMissingRoutes from './ndeliusRecordMissingRoutes'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

jest.mock('../../../../../services/licenceService')

describe('Route Handlers - Create Time Served Licence - Confirm Create', () => {
  const handler = new NDeliusRecordMissingRoutes(licenceService)
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
      licenceStartDate: '18/07/2024',
      licenceKind: 'TIME_SERVED',
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
    it('should render NDelius record missing view', async () => {
      licenceService.getPrisonerDetail.mockResolvedValue(prisonerDetails)

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/prisonCreated/timeServed/ndeliusRecordMissing', {
        nomisId: 'ABC123',
        licenceStartDate: '18/07/2024',
        dateOfBirth: '06/12/1992',
        backLink: '/licence/view/cases',
      })
    })
  })
})
