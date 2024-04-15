import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'
import { Licence, OmuContact } from '../../../@types/licenceApiClientTypes'
import CheckAnswersRoutes from './checkAnswers'
import config from '../../../config'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Check Answers', () => {
  const handler = new CheckAnswersRoutes(licenceService, conditionService)
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
          appointmentTimeType: 'SPECIFIC_DATE_TIME',
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          bespokeConditions: [],
          comStaffId: 123,
          forename: 'Jim',
          surname: 'Jones',
          statusCode: LicenceStatus.IN_PROGRESS,
          isDueForEarlyRelease: true,
        } as Licence,
      },
    } as unknown as Response
    conditionService.getAdditionalAPConditionsForSummaryAndPdf.mockResolvedValue([])
    conditionService.getbespokeConditionsForSummaryAndPdf.mockResolvedValue(res.locals.licence.bespokeConditions)
  })

  describe('GET', () => {
    it('should render view and not record audit event (owner)', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
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
      await handler.GET(reqWithEmptySession, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: '/licence/create/caseload',
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
      })
    })

    it('should render view and record audit event (not owner)', async () => {
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
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
    })

    it('should allow PPs to edit initial appointment details for non-variations', async () => {
      res.locals.licence.kind = LicenceKind.CRD

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
      })
    })

    it('should not allow PPs to edit initial appointment details for variations', async () => {
      res.locals.licence.kind = LicenceKind.VARIATION

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: false,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
      })
    })

    it('should read flash message for initial appointment updates', async () => {
      await handler.GET(req, res)

      expect(req.flash).toHaveBeenCalledWith('initialApptUpdated')
    })

    describe('when hard stop is enabled', () => {
      const existingConfig = config
      beforeAll(() => {
        config.hardStopEnabled = true
      })

      afterAll(() => {
        config.hardStopEnabled = existingConfig.hardStopEnabled
      })

      it('should allow PPs to edit initial appointment details for non-variations that are not in the hard stop period', async () => {
        res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: false } as Licence

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
          additionalConditions: [],
          bespokeConditionsToDisplay: [],
          backLink: req.session.returnToCase,
          initialApptUpdatedMessage: undefined,
          canEditInitialAppt: true,
          isInHardStopPeriod: false,
          statusCode: 'IN_PROGRESS',
        })
      })

      it('should not allow PPs to edit initial appointment details for non-variations in the hard stop period', async () => {
        res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true } as Licence

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
          additionalConditions: [],
          bespokeConditionsToDisplay: [],
          backLink: req.session.returnToCase,
          initialApptUpdatedMessage: undefined,
          canEditInitialAppt: false,
          isInHardStopPeriod: true,
          statusCode: 'IN_PROGRESS',
        })
      })

      it('should pass through the OMU email details', async () => {
        licenceService.getOmuEmail.mockResolvedValue({ email: 'test@test.test' } as OmuContact)
        res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true } as Licence

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
          additionalConditions: [],
          bespokeConditionsToDisplay: [],
          backLink: req.session.returnToCase,
          initialApptUpdatedMessage: undefined,
          canEditInitialAppt: false,
          isInHardStopPeriod: true,
          statusCode: 'IN_PROGRESS',
          omuEmail: 'test@test.test',
        })
      })
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
      } as Licence

      await handler.POST(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([
          { field: 'appointmentPerson', message: "Select 'Change' to go back and add who to meet" },
          { field: 'appointmentAddress', message: "Select 'Change' to go back and add appointment address" },
          { field: 'appointmentContact', message: "Select 'Change' to go back and add appointment telephone number" },
          { field: 'appointmentTimeType', message: "Select 'Change' to go back and add appointment date and time" },
        ])
      )
      expect(res.redirect).toHaveBeenCalledWith('back')
    })

    it('should call the licence API to submit the licence for approval', async () => {
      licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)
      expect(licenceService.submitLicence).toHaveBeenCalledWith('1', {
        username: 'joebloggs',
        deliusStaffIdentifier: 123,
      })
    })

    it('should redirect to the confirmation page', async () => {
      licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/confirmation')
    })
  })
})
