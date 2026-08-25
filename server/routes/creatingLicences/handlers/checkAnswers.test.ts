import { Request, Response } from 'express'
import { ValidationError } from 'class-validator'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'
import { Licence, OmuContact } from '../../../@types/licenceApiClientTypes'
import CheckAnswersRoutes from './checkAnswers'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'
import HdcService from '../../../services/hdc/hdcService'
import config from '../../../config'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')
jest.mock('../../../services/hdc/hdcService')

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>
const hdcService = new HdcService(null) as jest.Mocked<HdcService>

describe('Route Handlers - Create Licence - Check Answers', () => {
  const handler = new CheckAnswersRoutes(licenceService, conditionService, hdcService)
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
      get: jest.fn().mockReturnValue('/previous-page'),
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
          appointmentPersonType: 'SPECIFIC_PERSON',
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentTelephoneNumber: '07891245678',
          appointmentAlternativeTelephoneNumber: '07891245678',
          appointmentTime: '01/12/2021 00:34',
          appointmentTimeType: 'SPECIFIC_DATE_TIME',
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          bespokeConditions: [],
          comStaffId: 123,
          forename: 'Test',
          surname: 'Person',
          statusCode: LicenceStatus.IN_PROGRESS,
          isInHardStopPeriod: false,
          kind: LicenceKind.CRD,
        } as Licence,
      },
    } as unknown as Response

    conditionService.getAdditionalAPConditionsForSummaryAndPdf.mockResolvedValue([])
    conditionService.getbespokeConditionsForSummaryAndPdf.mockResolvedValue(res.locals.licence.bespokeConditions)
    hdcService.isVariationOfHdcMigration.mockResolvedValue(false)
  })

  describe('GET', () => {
    it('should render view and not record audit event (owner)', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should set warning banner when the appointment time is missing and finalThirdEnabled is true', async () => {
      res.locals.licence.missingAppointmentTime = true
      const original = config.finalThirdEnabled
      config.finalThirdEnabled = true
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
        banner: {
          type: 'warning',
          text: 'You must set a date and time for the appointment before the licence can be printed.',
          iconFallbackText: 'Warning',
        },
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      config.finalThirdEnabled = original
    })

    it('should not set warning banner when finalThirdEnabled is not enabled', async () => {
      res.locals.licence.appointmentTimeType = null
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
        banner: undefined,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it.each([
      {
        statusCode: LicenceStatus.APPROVED,
        bannerText:
          'Details updated. You must set a date and time for the appointment before the licence can be printed.',
        flashMessage: 'Details update',
      },
      {
        statusCode: LicenceStatus.APPROVED,
        bannerText: 'You must set a date and time for the appointment before the licence can be printed.',
        flashMessage: '',
      },
      {
        statusCode: LicenceStatus.SUBMITTED,
        bannerText:
          'Details updated. You must set a date and time for the appointment before the licence can be approved.',
        flashMessage: 'Details update',
      },
      {
        statusCode: LicenceStatus.SUBMITTED,
        bannerText: 'You must set a date and time for the appointment before the licence can be approved.',
        flashMessage: '',
      },
    ])('should create a warning banner when the time is not set', async ({ statusCode, bannerText, flashMessage }) => {
      res.locals.licence.missingAppointmentTime = true
      res.locals.licence.statusCode = statusCode as Licence['statusCode']
      const original = config.finalThirdEnabled
      config.finalThirdEnabled = true
      req = {
        ...req,
        flash: jest.fn().mockImplementation((key: string) => {
          if (key === 'initialApptUpdated') {
            return [flashMessage]
          }
          return []
        }),
      } as unknown as Request
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode,
        isVariationOfHdcMigration: false,
        banner: {
          text: bannerText,
          iconFallbackText: 'Warning',
          type: 'warning',
        },
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      config.finalThirdEnabled = original
    })

    it('should create a success banner when details are updated', async () => {
      req = {
        ...req,
        flash: jest.fn().mockImplementation((key: string) => {
          if (key === 'initialApptUpdated') {
            return ['Details updated']
          }
          return []
        }),
      } as unknown as Request
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
        banner: { text: 'Details updated', iconFallbackText: 'Success', type: 'success' },
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
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
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
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
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
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
      })
    })

    it('should not allow PPs to edit initial appointment details for variations', async () => {
      res.locals.licence = { ...res.locals.licence, kind: LicenceKind.VARIATION, isVariation: true } as Licence

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        canEditInitialAppt: false,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: false,
      })
    })

    it('should read flash message for initial appointment updates', async () => {
      await handler.GET(req, res)

      expect(req.flash).toHaveBeenCalledWith('initialApptUpdated')
    })

    it('should pass through isVariationOfHdcMigration flag for variations of migrated HDC licences', async () => {
      hdcService.isVariationOfHdcMigration.mockResolvedValue(true)

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        isVariationOfHdcMigration: true,
      })
    })

    describe('when hard stop is enabled', () => {
      it('should allow PPs to edit initial appointment details for non-variations that are not in the hard stop period', async () => {
        res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: false } as Licence

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
          additionalConditions: [],
          bespokeConditionsToDisplay: [],
          backLink: req.session.returnToCase,
          canEditInitialAppt: true,
          isInHardStopPeriod: false,
          statusCode: 'IN_PROGRESS',
          isVariationOfHdcMigration: false,
        })
      })

      it('should not allow PPs to edit initial appointment details for non-variations in the hard stop period', async () => {
        res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true } as Licence

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
          additionalConditions: [],
          bespokeConditionsToDisplay: [],
          backLink: req.session.returnToCase,
          canEditInitialAppt: false,
          isInHardStopPeriod: true,
          statusCode: 'IN_PROGRESS',
          isVariationOfHdcMigration: false,
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
          isVariationOfHdcMigration: false,
        })
      })
    })
  })

  describe('POST', () => {
    it('should redirect back with error messages in flash if licence fields are empty', async () => {
      res.locals.licence = {
        appointmentPerson: '',
        appointmentAddress: '',
        appointmentTelephoneNumber: '',
        appointmentTime: '',
        additionalLicenceConditions: [],
        additionalPssConditions: [],
      } as Licence

      await handler.POST(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([
          { field: 'appointmentPersonType', message: "Select 'Change' to go back and add who to meet" },
          { field: 'appointmentAddress', message: "Select 'Change' to go back and add appointment address" },
          {
            field: 'appointmentTelephoneNumber',
            message: "Select 'Change' to go back and add appointment telephone number",
          },
          { field: 'appointmentTimeType', message: "Select 'Change' to go back and add appointment date and time" },
        ]),
      )
      expect(res.redirect).toHaveBeenCalledWith('/previous-page')
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

    it('should redirect back with error messages in flash if appointment person field is empty', async () => {
      req.get = jest.fn().mockReturnValue(undefined) // Simulate no referer
      res.locals.licence = {
        ...res.locals.licence,
        appointmentPersonType: 'SPECIFIC_PERSON',
        appointmentPerson: '',
      } as Licence

      await handler.POST(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([{ field: 'appointmentPerson', message: "Select 'Change' to go back and add who to meet" }]),
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should not redirect back with error messages in flash if appointment person field is empty', async () => {
      res.locals.licence = {
        ...res.locals.licence,
        appointmentPersonType: 'DUTY_OFFICER',
        appointmentPerson: '',
        version: '2.0',
      } as Licence
      licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)

      expect(licenceService.submitLicence).toHaveBeenCalledWith('1', {
        username: 'joebloggs',
        deliusStaffIdentifier: 123,
      })
    })

    it('should redirect to the reason-for-variation page if the licence is a variation', async () => {
      res.locals.licence.kind = LicenceKind.VARIATION
      licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/reason-for-variation')
    })

    it('should redirect to the reason-for-variation page if the licence is an HDC variation', async () => {
      res.locals.licence.kind = LicenceKind.HDC_VARIATION
      licenceService.getParentLicenceOrSelf.mockResolvedValue({ version: '2.0' } as Licence)
      conditionService.getPolicyVersion.mockResolvedValue('2.0')
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/reason-for-variation')
    })
  })

  describe('flattenValidationErrors', () => {
    it('should return a flat array for single-level errors', () => {
      const errors: ValidationError[] = [
        {
          property: 'field1',
          constraints: { isDefined: 'Field1 is required' },
          children: [],
        } as ValidationError,
        {
          property: 'field2',
          constraints: { isNotEmpty: 'Field2 must not be empty' },
          children: [],
        } as ValidationError,
      ]

      const result = handler.flattenValidationErrors(errors)
      expect(result).toEqual([
        { field: 'field1', message: 'Field1 is required' },
        { field: 'field2', message: 'Field2 must not be empty' },
      ])
    })

    it('should handle nested errors and build property path', () => {
      const errors: ValidationError[] = [
        {
          property: 'parent',
          constraints: undefined,
          children: [
            {
              property: 'child',
              constraints: { isDefined: 'Child is required' },
              children: [],
            } as ValidationError,
          ],
        } as ValidationError,
      ]

      const result = handler.flattenValidationErrors(errors)
      expect(result).toEqual([{ field: 'parent-child', message: 'Child is required' }])
    })

    it('should handle deeply nested errors', () => {
      const errors: ValidationError[] = [
        {
          property: 'level1',
          constraints: undefined,
          children: [
            {
              property: 'level2',
              constraints: undefined,
              children: [
                {
                  property: 'level3',
                  constraints: { isDefined: 'Level3 is required' },
                  children: [],
                } as ValidationError,
              ],
            } as ValidationError,
          ],
        } as ValidationError,
      ]

      const result = handler.flattenValidationErrors(errors)
      expect(result).toEqual([{ field: 'level1-level2-level3', message: 'Level3 is required' }])
    })

    it('should return an empty array if there are no errors', () => {
      const result = handler.flattenValidationErrors([])
      expect(result).toEqual([])
    })

    it('should skip errors without constraints or children', () => {
      const errors: ValidationError[] = [
        {
          property: 'field',
          constraints: undefined,
          children: [],
        } as ValidationError,
      ]
      const result = handler.flattenValidationErrors(errors)
      expect(result).toEqual([])
    })
  })
})
