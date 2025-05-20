import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'
import { Licence, OmuContact } from '../../../@types/licenceApiClientTypes'
import CheckAnswersRoutes from './checkAnswers'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'
import HdcService, { CvlHdcLicenceData } from '../../../services/hdcService'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')
jest.mock('../../../services/hdcService')

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>
const hdcService = new HdcService(null) as jest.Mocked<HdcService>

describe('Route Handlers - Create Licence - Check Answers', () => {
  const handler = new CheckAnswersRoutes(licenceService, conditionService, hdcService)
  let req: Request
  let res: Response

  const exampleHdcLicenceData = {
    curfewAddress: {
      addressLine1: 'addressLineOne',
      addressLine2: 'addressLineTwo',
      townOrCity: 'addressTownOrCity',
      county: 'county',
      postcode: 'addressPostcode',
    },
    firstNightCurfewHours: {
      firstNightFrom: '09:00',
      firstNightUntil: '17:00',
    },
    curfewTimes: [
      {
        curfewTimesSequence: 1,
        fromDay: 'MONDAY',
        fromTime: '17:00:00',
        untilDay: 'TUESDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 2,
        fromDay: 'TUESDAY',
        fromTime: '17:00:00',
        untilDay: 'WEDNESDAY',
        untilTime: '09:00:00',
      },
    ],
    allCurfewTimesEqual: true,
  } as CvlHdcLicenceData

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
          appointmentPersonType: 'SPECIFIC_PERSON',
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentContact: '07891245678',
          appointmentTime: '01/12/2021 00:34',
          appointmentTimeType: 'SPECIFIC_DATE_TIME',
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          bespokeConditions: [],
          comStaffId: 123,
          forename: 'Test',
          surname: 'Person',
          statusCode: LicenceStatus.IN_PROGRESS,
          isDueForEarlyRelease: true,
          isInHardStopPeriod: false,
          kind: LicenceKind.CRD,
        } as Licence,
      },
    } as unknown as Response

    conditionService.getAdditionalAPConditionsForSummaryAndPdf.mockResolvedValue([])
    conditionService.getbespokeConditionsForSummaryAndPdf.mockResolvedValue(res.locals.licence.bespokeConditions)
    hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)
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
        hdcLicenceData: null,
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
        hdcLicenceData: null,
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
        hdcLicenceData: null,
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
        hdcLicenceData: null,
      })
    })

    it('should not allow PPs to edit initial appointment details for variations', async () => {
      res.locals.licence = { ...res.locals.licence, kind: LicenceKind.VARIATION, isVariation: true }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: false,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        hdcLicenceData: null,
      })
    })

    it('should read flash message for initial appointment updates', async () => {
      await handler.GET(req, res)

      expect(req.flash).toHaveBeenCalledWith('initialApptUpdated')
    })

    it('should pass through HDC licence data for HDC licences', async () => {
      res.locals.licence.kind = LicenceKind.HDC

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        hdcLicenceData: exampleHdcLicenceData,
      })
    })

    it('should pass through HDC licence data for HDC variations', async () => {
      res.locals.licence.kind = LicenceKind.HDC_VARIATION

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        additionalConditions: [],
        bespokeConditionsToDisplay: [],
        backLink: req.session.returnToCase,
        initialApptUpdatedMessage: undefined,
        canEditInitialAppt: true,
        isInHardStopPeriod: false,
        statusCode: 'IN_PROGRESS',
        hdcLicenceData: exampleHdcLicenceData,
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
          initialApptUpdatedMessage: undefined,
          canEditInitialAppt: true,
          isInHardStopPeriod: false,
          statusCode: 'IN_PROGRESS',
          hdcLicenceData: null,
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
          hdcLicenceData: null,
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
          hdcLicenceData: null,
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
          { field: 'appointmentPersonType', message: "Select 'Change' to go back and add who to meet" },
          { field: 'appointmentAddress', message: "Select 'Change' to go back and add appointment address" },
          { field: 'appointmentContact', message: "Select 'Change' to go back and add appointment telephone number" },
          { field: 'appointmentTimeType', message: "Select 'Change' to go back and add appointment date and time" },
        ]),
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

    it('should redirect back with error messages in flash if appointment person field is empty', async () => {
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
      expect(res.redirect).toHaveBeenCalledWith('back')
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
})
