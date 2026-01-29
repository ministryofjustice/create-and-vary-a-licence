import { Request, Response } from 'express'

import ViewAndPrintLicenceRoutes from './viewLicence'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'
import HdcService, { CvlHdcLicenceData } from '../../../services/hdcService'

const username = 'joebloggs'
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const hdcService = new HdcService(null) as jest.Mocked<HdcService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/hdcService')

describe('Route - view and approve a licence', () => {
  const handler = new ViewAndPrintLicenceRoutes(licenceService, hdcService)
  let req: Request
  let res: Response

  const licence = {
    id: 1,
    statusCode: LicenceStatus.ACTIVE,
    surname: 'Bobson',
    forename: 'Bob',
    appointmentTime: '12/12/2022 14:16',
    additionalLicenceConditions: [],
    additionalPssConditions: [],
    bespokeConditions: [],
    comStaffId: 123,
    kind: LicenceKind.CRD,
    isInHardStopPeriod: false,
  } as Licence

  const user = {
    username,
    deliusStaffIdentifier: 123,
    authSource: 'nomis',
  }

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

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
      query: {},
      flash: jest.fn(),
    } as unknown as Request
    licenceService.recordAuditEvent = jest.fn()
    hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)
  })

  describe('GET', () => {
    it('should render a single licence view for printing when ACTIVE', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user,
          licence,
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
        isEditableByPrison: false,
        isPrisonUser: true,
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should render a single licence view for printing when APPROVED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { ...user, deliusStaffIdentifier: 999 },
          licence: { ...licence, statusCode: LicenceStatus.APPROVED },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
        isEditableByPrison: false,
        isPrisonUser: true,
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
    })

    it('should not render view when status is NOT_STARTED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user,
          licence: { ...licence, statusCode: LicenceStatus.NOT_STARTED },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should render a warning message when displaying an approved licence with a newer version in progress', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user,
          licence,
        },
      } as unknown as Response

      req.query.latestVersion = '12'
      licenceService.getLicence.mockResolvedValue({
        id: 1,
        statusCode: 'IN_PROGRESS',
        dateCreated: '15/12/2022 14:16:56',
      } as Licence)
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
        isEditableByPrison: false,
        isPrisonUser: true,
        warningMessage:
          "This is the last approved version of this person's licence.<br />Another version was started on 15 December 2022.<br />" +
          'You can print the most recent version once it has been approved.',
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should render a warning message when displaying an in progress version of an approved licence', async () => {
      const inProgressLicence = {
        ...licence,
        statusCode: 'IN_PROGRESS',
        dateCreated: '15/06/2012 11:58:34',
      }

      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user,
          licence: inProgressLicence,
        },
      } as unknown as Response

      req.query.lastApprovedVersion = '12'
      licenceService.getLicence.mockResolvedValue({
        id: 1,
        statusCode: 'APPROVED',
        approvedDate: '25/04/2022 06:37:15',
      } as Licence)
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
        isEditableByPrison: false,
        isPrisonUser: true,
        warningMessage:
          'This is the most recent version of this licence that was submitted on 15 June 2012.<br />' +
          'Once this version is approved, you can print it.<br /><a href="/licence/view/id/1/pdf-print" target="_blank">' +
          'You can also view and print the last approved version of this licence</a>.',
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should read flash message for initial appointment updates', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user,
          licence,
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(req.flash).toHaveBeenCalledWith('initialApptUpdated')
    })

    describe('when hard stop is enabled', () => {
      it('should be editable by prison CAs when in the hard stop window', async () => {
        res = {
          render: jest.fn(),
          redirect: jest.fn(),
          locals: {
            user,
            licence: { ...licence, statusCode: LicenceStatus.APPROVED, isInHardStopPeriod: true },
          },
        } as unknown as Response

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/view/view', {
          additionalConditions: [],
          isEditableByPrison: true,
          isPrisonUser: true,
          hdcLicenceData: null,
        })
        expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      })

      it('should not be editable by prison when the release date is more than two days in the future', async () => {
        res = {
          render: jest.fn(),
          redirect: jest.fn(),
          locals: {
            user,
            licence: { ...licence, isInHardStopPeriod: false },
          },
        } as unknown as Response

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/view/view', {
          additionalConditions: [],
          isEditableByPrison: false,
          isPrisonUser: true,
          hdcLicenceData: null,
        })
        expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      })

      it('should not be editable by prison CAs when in the hard stop window and with licence status ACTIVE', async () => {
        res = {
          render: jest.fn(),
          redirect: jest.fn(),
          locals: {
            user,
            licence: { ...licence, isInHardStopPeriod: true },
          },
        } as unknown as Response

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/view/view', {
          additionalConditions: [],
          isEditableByPrison: false,
          isPrisonUser: true,
          hdcLicenceData: null,
        })
        expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      })

      it('should not be editable by prison CAs when in the hard stop window and with licence kind VARIATION', async () => {
        res = {
          render: jest.fn(),
          redirect: jest.fn(),
          locals: {
            user,
            licence: {
              ...licence,
              statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
              kind: LicenceKind.VARIATION,
              isInHardStopPeriod: true,
            },
          },
        } as unknown as Response

        await handler.GET(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/licence/view/cases')
        expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      })
    })

    describe('when it is a time served case', () => {
      it('should be editable by prison CAs when it is a time served case', async () => {
        res = {
          render: jest.fn(),
          redirect: jest.fn(),
          locals: {
            user,
            licence: {
              ...licence,
              statusCode: LicenceStatus.APPROVED,
              kind: LicenceKind.TIME_SERVED,
              isInHardStopPeriod: false,
            },
          },
        } as unknown as Response

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/view/view', {
          additionalConditions: [],
          isEditableByPrison: true,
          isPrisonUser: true,
          hdcLicenceData: null,
        })
        expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      })

      it('should not be editable by prison CAs when it is a time served case and with licence status ACTIVE', async () => {
        res = {
          render: jest.fn(),
          redirect: jest.fn(),
          locals: {
            user,
            licence: { ...licence, kind: LicenceKind.TIME_SERVED, isInHardStopPeriod: false },
          },
        } as unknown as Response

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/view/view', {
          additionalConditions: [],
          isEditableByPrison: false,
          isPrisonUser: true,
          hdcLicenceData: null,
        })
        expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      })
    })

    it('should set isPrisonUser to false when the auth source is not nomis', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, deliusStaffIdentifier: 123, authSource: 'something_else' },
          licence,
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
        isEditableByPrison: false,
        isPrisonUser: false,
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should pass through the HDC licence data when it is a HDC licence', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user,
          licence: { ...licence, kind: LicenceKind.HDC },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
        isEditableByPrison: false,
        isPrisonUser: true,
        hdcLicenceData: exampleHdcLicenceData,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should pass through the HDC licence data when it is a HDC variation', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user,
          licence: { ...licence, kind: LicenceKind.HDC_VARIATION },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
        isEditableByPrison: false,
        isPrisonUser: true,
        hdcLicenceData: exampleHdcLicenceData,
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })
  })

  describe('POST', () => {
    it('should submit the licence response and redirect to the confirmation page', async () => {
      req = {
        params: {
          licenceId: 1,
        },
        flash: jest.fn(),
        query: {},
      } as unknown as Request

      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username: 'joebloggs',
          },
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
            appointmentPersonType: 'DUTY_OFFICER',
            appointmentPerson: '',
            appointmentAddress: 'some address',
            appointmentTelephoneNumber: '0123456789',
            appointmentAlternativeTelephoneNumber: '02234567890',
            appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
          },
        },
      } as unknown as Response

      await handler.POST(req, res)

      expect(licenceService.submitLicence).toHaveBeenCalledWith(1, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/confirmation')
    })

    it('should fail to process due to validation issues', async () => {
      req = {
        params: {
          licenceId: 1,
        },
        flash: jest.fn(),
        query: {},
        get: jest.fn().mockReturnValue('/previous-page'),
      } as unknown as Request

      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username: 'joebloggs',
          },
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
          },
        },
      } as unknown as Response

      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/previous-page')
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        '[{"field":"appointmentPersonType","message":"Select \'Change\' to go back and add who to meet"},{"field":"appointmentAddress","message":"Select \'Change\' to go back and add appointment address"},{"field":"appointmentTelephoneNumber","message":"Select \'Change\' to go back and add appointment telephone number"},{"field":"appointmentTimeType","message":"Select \'Change\' to go back and add appointment date and time"}]',
      )
    })

    it('should redirect back with error messages in flash if appointment person field is empty', async () => {
      req = {
        params: {
          licenceId: 1,
        },
        flash: jest.fn(),
        query: {},
        get: jest.fn().mockReturnValue(undefined), // Simulate no referer
      } as unknown as Request

      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username: 'joebloggs',
          },
          licence: {
            id: 1,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
            appointmentPersonType: 'SPECIFIC_PERSON',
            appointmentPerson: '',
            appointmentAddress: 'some address',
            appointmentTelephoneNumber: '0123456789',
            appointmentAlternativeTelephoneNumber: '02234567890',
            appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
          },
        },
      } as unknown as Response

      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        '[{"field":"appointmentPerson","message":"Select \'Change\' to go back and add who to meet"}]',
      )
    })
  })
})
