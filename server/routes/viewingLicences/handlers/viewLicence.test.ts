import { Request, Response } from 'express'

import ViewAndPrintLicenceRoutes from './viewLicence'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'

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
  } as Licence

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
      query: {},
    } as unknown as Request
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('GET', () => {
    it('should render a single licence view for printing when ACTIVE', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, deliusStaffIdentifier: 123 },
          licence,
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should render a single licence view for printing when APPROVED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, deliusStaffIdentifier: 999 },
          licence: { ...licence, statusCode: LicenceStatus.APPROVED },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/view', {
        additionalConditions: [],
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
    })

    it('should not render view when status is NOT_STARTED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, deliusStaffIdentifier: 999 },
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
          user: { username, deliusStaffIdentifier: 123 },
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
          user: { username, deliusStaffIdentifier: 123 },
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
        warningMessage:
          'This is the most recent version of this licence that was submitted on 15 June 2012.<br />' +
          'Once this version is approved, you can print it.<br /><a href="/licence/view/id/1/pdf-print" target="_blank">' +
          'You can also view and print the last approved version of this licence</a>.',
      })
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })
  })
})
