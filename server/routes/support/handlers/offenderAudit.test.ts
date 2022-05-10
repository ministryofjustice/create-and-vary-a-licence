import { Request, Response } from 'express'
import OffenderAuditRoutes from './offenderAudit'
import PrisonerService from '../../../services/prisonerService'
import LicenceService from '../../../services/licenceService'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { AuditEvent } from '../../../@types/licenceApiClientTypes'
import { convertToTitleCase } from '../../../utils/utils'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/prisonerService')
jest.mock('../../../services/licenceService')

describe('Route Handlers - Offender audit', () => {
  const handler = new OffenderAuditRoutes(licenceService, prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      locals: {
        user: {},
      },
      render: jest.fn(),
    } as unknown as Response
    req = {} as Request
  })

  describe('GET', () => {
    it('Should render all audit information', async () => {
      req.params = {
        nomsId: 'ABC123',
        licenceId: '1',
      }

      const expectedPrisonerDetail = {
        prisonerNumber: 'ABC123',
        firstName: 'Peter',
        lastName: 'Pepper',
        conditionalReleaseDate: '2022-06-01',
        confirmedReleaseDate: '2022-06-01',
        postRecallReleaseDate: '2022-05-01',
        topupSupervisionExpiryDate: '2023-05-01',
        homeDetentionCurfewEligibilityDate: '2022-05-01',
        sentenceExpiryDate: '2022-06-01',
        licenceExpiryDate: '2022-06-01',
        paroleEligibilityDate: '2022-01-01',
        indeterminateSentence: false,
        dateOfBirth: '1970-01-01',
      } as Prisoner

      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([expectedPrisonerDetail])

      const expectedAuditDetail = {
        id: 1,
        licenceId: 1,
        eventTime: '2022-06-01',
        username: 'dave_jones',
        fullName: 'Dave Jones',
        eventType: 'USER_EVENT',
        summary: 'Audit Summary 1',
        detail: 'ID 2 changed event data',
      } as AuditEvent

      licenceService.getAuditEvents.mockResolvedValue([expectedAuditDetail])
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/support/offenderAudit', {
        prisonerDetail: {
          id: expectedPrisonerDetail.prisonerNumber,
          name: convertToTitleCase(`${expectedPrisonerDetail.firstName} ${expectedPrisonerDetail.lastName}`),
        },
        audit: [expectedAuditDetail],
      })
    })
  })
})
