import { Request, Response } from 'express'

import ViewAndPrintLicenceRoutes from './viewLicence'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

const username = 'joebloggs'
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route - view and approve a licence', () => {
  const handler = new ViewAndPrintLicenceRoutes(licenceService)
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
    kind: 'CRD',
    isInHardStopPeriod: false,
  } as Licence

  const user = {
    username,
    deliusStaffIdentifier: 123,
    authSource: 'nomis',
  }

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
      query: {},
      flash: jest.fn(),
    } as unknown as Request
    licenceService.recordAuditEvent = jest.fn()
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
            appointmentContact: '0123455666',
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

      expect(res.redirect).toHaveBeenCalledWith('back')
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        '[{"field":"appointmentPersonType","message":"Select \'Change\' to go back and add who to meet"},{"field":"appointmentAddress","message":"Select \'Change\' to go back and add appointment address"},{"field":"appointmentContact","message":"Select \'Change\' to go back and add appointment telephone number"},{"field":"appointmentTimeType","message":"Select \'Change\' to go back and add appointment date and time"}]',
      )
    })

    it('should redirect back with error messages in flash if appointment person field is empty', async () => {
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
            appointmentPersonType: 'SPECIFIC_PERSON',
            appointmentPerson: '',
            appointmentAddress: 'some address',
            appointmentContact: '0123455666',
            appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
          },
        },
      } as unknown as Response

      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('back')
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        '[{"field":"appointmentPerson","message":"Select \'Change\' to go back and add who to meet"}]',
      )
    })
  })
})
