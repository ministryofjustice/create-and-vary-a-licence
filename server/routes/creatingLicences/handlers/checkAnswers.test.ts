import { Request, Response } from 'express'

import { addDays, format, subDays } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import CheckAnswersRoutes from './checkAnswers'
import { LicenceApiClient } from '../../../data'
import ConditionFormatter from '../../../services/conditionFormatter'
import PrisonerService from '../../../services/prisonerService'
import CommunityService from '../../../services/communityService'

jest.mock('../../../data/licenceApiClient')
jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

const conditionFormatter = new ConditionFormatter()
const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
const conditionService = new ConditionService(licenceApiClient, conditionFormatter) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(licenceApiClient, prisonerService, communityService, conditionService)

describe('Route Handlers - Create Licence - Check Answers', () => {
  const handler = new CheckAnswersRoutes(licenceApiClient, licenceService, conditionService)
  let req: Request
  let res: Response

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      session: {
        returnToCase: 'some-back-link',
      },
      flash: jest.fn(),
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
          deliusStaffIdentifier: 123,
        },
        licence: {
          id: 1,
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentContact: '07891245678',
          appointmentTime: '01/12/2021 00:34',
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          bespokeConditions: [],
          comStaffId: 123,
          forename: 'Jim',
          surname: 'Jones',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view and not record audit event (owner)', async () => {
      conditionService.additionalConditionsCollection.mockReturnValue({
        additionalConditions: [],
        conditionsWithUploads: [],
      })
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        isInPssPeriod: false,
        conditionsWithUploads: [],
        backLink: req.session.returnToCase,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should render default return to caseload link if no session state', async () => {
      const reqWithEmptySession = {
        params: {
          licenceId: '1',
        },
        session: {},
        flash: jest.fn(),
      } as unknown as Request

      conditionService.additionalConditionsCollection.mockReturnValue({
        additionalConditions: [],
        conditionsWithUploads: [],
      })
      await handler.GET(reqWithEmptySession, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        conditionsWithUploads: [],
        isInPssPeriod: false,
        backLink: '/licence/create/caseload',
      })
    })

    it('should render view and record audit event (not owner)', async () => {
      conditionService.additionalConditionsCollection.mockReturnValue({
        additionalConditions: [],
        conditionsWithUploads: [],
      })
      res = {
        ...res,
        locals: {
          ...res.locals,
          user: {
            username: 'joebloggs',
            deliusStaffIdentifier: 999,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        conditionsWithUploads: [],
        isInPssPeriod: false,
        backLink: req.session.returnToCase,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
    })

    it('should render view, record audit event (not owner) and PSS period should be true', async () => {
      conditionService.additionalConditionsCollection.mockReturnValue({
        additionalConditions: [],
        conditionsWithUploads: [],
      })
      res = {
        ...res,
        locals: {
          licence: {
            licenceExpiryDate: format(subDays(new Date(), 1), 'dd/MM/yyyy'),
            topupSupervisionExpiryDate: format(addDays(new Date(), 1), 'dd/MM/yyyy'),
          },
          user: {
            username: 'joebloggs',
            deliusStaffIdentifier: 999,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        conditionsWithUploads: [],
        isInPssPeriod: false,
        backLink: req.session.returnToCase,
      })
      res = {
        ...res,
        locals: {
          licence: {
            licenceExpiryDate: format(subDays(new Date(), 1), 'dd/MM/yyyy'),
            topupSupervisionExpiryDate: format(addDays(new Date(), 1), 'dd/MM/yyyy'),
          },
          user: {
            username: 'joebloggs',
            deliusStaffIdentifier: 999,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        conditionsWithUploads: [],
        isInPssPeriod: false,
        backLink: req.session.returnToCase,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
    })
  })

  describe('POST', () => {
    it('should redirect back with error messages in flash if licence fields are empty', async () => {
      res.locals.licence = {
        appointmentPerson: '',
        appointmentAddress: '',
        appointmentContact: '',
        appointmentTime: '',
        additionalLicenceConditions: [],
        additionalPssConditions: [],
      }

      await handler.POST(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([
          { field: 'appointmentPerson', message: "Select 'Change' to go back and add who to meet" },
          { field: 'appointmentAddress', message: "Select 'Change' to go back and add appointment address" },
          { field: 'appointmentContact', message: "Select 'Change' to go back and add appointment telephone number" },
          { field: 'appointmentTime', message: "Select 'Change' to go back and add appointment date and time" },
        ])
      )
      expect(res.redirect).toHaveBeenCalledWith('back')
    })

    it('should call the licence API to submit the licence for approval', async () => {
      licenceApiClient.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)
      expect(licenceService.submitLicence).toHaveBeenCalledWith('1', {
        username: 'joebloggs',
        deliusStaffIdentifier: 123,
      })
    })

    it('should redirect to the confirmation page', async () => {
      licenceApiClient.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/confirmation')
    })
  })
})
