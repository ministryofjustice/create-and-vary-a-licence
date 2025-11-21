import { Request, Response } from 'express'
import TimeServedService from '../../../../../services/timeServedService'
import ContactProbationTeamRoutes from './contactProbationTeamRoutes'
import { type TimeServedProbationConfirmContactRequest } from '../../../../../@types/licenceApiClientTypes'
import logger from '../../../../../../logger'

jest.mock('../../../../../services/timeServedService')
jest.mock('../../../../../../logger')

describe('ContactProbationTeamRoutes', () => {
  let req: Request
  let res: Response
  let timeServedService: jest.Mocked<TimeServedService>
  let handler: ContactProbationTeamRoutes

  beforeEach(() => {
    timeServedService = new TimeServedService(null) as jest.Mocked<TimeServedService>
    handler = new ContactProbationTeamRoutes(timeServedService)

    req = {
      body: {},
      params: { licenceId: '123' },
      session: { returnToCase: '/back-link' },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: { licence: { id: 123 }, user: { username: 'blog' } },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render the confirm contact probation team page with licence and backLink', async () => {
      // Given

      // When
      await handler.GET(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/create/prisonCreated/timeServed/confirmContactProbationTeam', {
        licence: res.locals.licence,
        backLink: req.session?.returnToCase || '/licence/view/cases',
      })
    })
  })

  describe('POST', () => {
    it('should call addTimeServedProbationConfirmContact and redirect when OTHER not included', async () => {
      // Given
      req.body = {
        contactStatus: 'ALREADY_CONTACTED',
        communicationMethods: ['EMAIL'],
      }

      // When
      await handler.POST(req, res)

      // Then
      expect(timeServedService.addTimeServedProbationConfirmContact).toHaveBeenCalledWith(
        123,
        {
          contactStatus: 'ALREADY_CONTACTED',
          communicationMethods: ['EMAIL'],
          otherCommunicationDetail: undefined,
        } as TimeServedProbationConfirmContactRequest,
        res.locals.user,
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/123/confirmation')
    })

    it('should include otherCommunicationDetail if communicationMethods includes OTHER', async () => {
      // Given
      req.body = {
        contactStatus: 'WILL_CONTACT_SOON',
        communicationMethods: ['OTHER'],
        otherCommunicationDetail: 'Letter',
      }

      // When
      await handler.POST(req, res)

      // Then
      expect(timeServedService.addTimeServedProbationConfirmContact).toHaveBeenCalledWith(
        123,
        {
          contactStatus: 'WILL_CONTACT_SOON',
          communicationMethods: ['OTHER'],
          otherCommunicationDetail: 'Letter',
        } as TimeServedProbationConfirmContactRequest,
        res.locals.user,
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/123/confirmation')
    })

    it('should log start and completion of POST', async () => {
      // Given
      const loggerInfoSpy = jest.spyOn(logger, 'info')
      req.body = {
        contactStatus: 'CANNOT_CONTACT',
        communicationMethods: ['PHONE'],
      }

      // When
      await handler.POST(req, res)

      // Then
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(1, 'ContactProbationTeamRoutes POST started')
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(2, 'ContactProbationTeamRoutes POST completed')
    })
  })
})
