import type { Express } from 'express'
import request from 'supertest'
import LicenceService from '../../services/licenceService'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { CvlPrisoner, Licence, OmuContact, PrisonerWithCvlFields } from '../../@types/licenceApiClientTypes'
import ProbationService from '../../services/probationService'
import ConditionService from '../../services/conditionService'
import UkBankHolidayFeedService, { BankHolidayRetriever } from '../../services/ukBankHolidayFeedService'
import { DeliusManager } from '../../@types/deliusClientTypes'
import { User } from '../../@types/CvlUserDetails'

let app: Express

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const bankHolidayRetriever: BankHolidayRetriever = async () => []
const ukBankHolidayFeedService = new UkBankHolidayFeedService(bankHolidayRetriever)
const probationService = new ProbationService(null) as jest.Mocked<ProbationService>

jest.mock('../../services/licenceService')
jest.mock('../../services/conditionService')
jest.mock('../../services/probationService')

const licence = {
  nomsId: 'A1234BC',
  probationTeamCode: 'ABC123',
  kind: 'CRD',
  id: 1,
  statusCode: 'IN_PROGRESS',
  version: '3.0',
} as Licence

const user = {
  username: 'joebloggs',
  deliusStaffIdentifier: 2000,
  probationTeamCodes: ['ABC123'],
  userRoles: ['ROLE_LICENCE_RO'],
} as User

beforeEach(() => {
  app = appWithAllRoutes({
    services: { licenceService, conditionService, ukBankHolidayFeedService, probationService },
    userSupplier: () => user,
  })
  licenceService.getOmuEmail.mockResolvedValue({ email: 'test@test.test' } as OmuContact)
  licenceService.getParentLicenceOrSelf.mockResolvedValue(licence)
  licenceService.createProbationLicence.mockResolvedValue({ licenceId: 1 })

  conditionService.getAdditionalAPConditionsForSummaryAndPdf.mockResolvedValue([])

  probationService.getProbationer.mockResolvedValue({
    crn: 'X12345',
  })
  probationService.getResponsibleCommunityManager.mockResolvedValue({
    code: 'X12345',
    id: 2000,
    username: 'joebloggs',
    email: 'joebloggs@probation.gov.uk',
    name: {
      forename: 'Joe',
      surname: 'Bloggs',
    },
    provider: {
      code: 'N01',
      description: 'N01 Region',
    },
    team: {
      code: 'ABC123',
      description: 'ABC123 Description',
      borough: {
        code: 'PDU1',
        description: 'PDU1 Description',
      },
      district: {
        code: 'LAU1',
        description: 'LAU1 Description',
      },
    },
  } as DeliusManager)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('createLicenceRoutes', () => {
  describe('in hard stop period', () => {
    beforeEach(() => {
      licenceService.getLicence.mockResolvedValue({ ...licence, isInHardStopPeriod: true } as Licence)
      licenceService.getPrisonerDetail.mockResolvedValue({ cvl: { isInHardStopPeriod: true } } as PrisonerWithCvlFields)
      licenceService.checkComCaseAccess.mockResolvedValue({ crn: 'crn', type: 'NONE' })
    })
    describe('GETs', () => {
      it('should redirect to access-denied when trying to access create a licence page', () => {
        return request(app)
          .get('/licence/create/nomisId/A1234BC/confirm')
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to access the additional licence conditions question', () => {
        return request(app)
          .get('/licence/create/id/1/additional-licence-conditions-question')
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to access the additional PSS conditions question', () => {
        return request(app)
          .get('/licence/create/id/1/additional-pss-conditions-question')
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to access the bespoke conditions question', () => {
        return request(app)
          .get('/licence/create/id/1/bespoke-conditions-question')
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to access the edit question', () => {
        return request(app).get('/licence/create/id/1/edit').expect(302).expect('Location', '/access-denied')
      })

      it('should allow access to check your answers page', () => {
        return request(app).get('/licence/create/id/1/check-your-answers').expect(200)
      })
    })

    describe('POSTs', () => {
      it('should redirect to access-denied when trying to create a licence', () => {
        return request(app)
          .post('/licence/create/nomisId/A1234BC/confirm')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to answer the additional licence conditions question', () => {
        return request(app)
          .post('/licence/create/id/1/additional-licence-conditions-question')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to answer the additional PSS conditions question', () => {
        return request(app)
          .post('/licence/create/id/1/additional-pss-conditions-question')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to answer the bespoke conditions question', () => {
        return request(app)
          .post('/licence/create/id/1/bespoke-conditions-question')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to answer the edit question', () => {
        return request(app)
          .post('/licence/create/id/1/edit')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/access-denied')
      })

      it('should redirect to access-denied when trying to submit a licence via CYA page', () => {
        return request(app)
          .post('/licence/create/id/1/check-your-answers')
          .expect(302)
          .expect('Location', '/access-denied')
      })
    })
  })

  describe('outside of hard stop period', () => {
    beforeEach(() => {
      licenceService.getLicence.mockResolvedValue({
        ...licence,
        isInHardStopPeriod: false,
        additionalLicenceConditions: [],
        additionalPssConditions: [],
        appointmentPersonType: 'SPECIFIC_PERSON',
        appointmentPerson: 'Bob Smith',
        appointmentAddress: '123 Fake St',
        appointmentTelephoneNumber: '00000000000',
        appointmentAlternativeTelephoneNumber: '07891245678',
        appointmentTimeType: 'IMMEDIATE_UPON_RELEASE',
      } as Licence)
      licenceService.getPrisonerDetail.mockResolvedValue({
        prisoner: {
          conditionalReleaseDate: '2020-01-01',
          confirmedReleaseDate: '2020-01-01',
          dateOfBirth: '2000-01-01',
          firstName: 'Joe',
          lastName: 'Bloggs',
        } as CvlPrisoner,
        cvl: { isInHardStopPeriod: false },
      } as PrisonerWithCvlFields)
      licenceService.checkComCaseAccess.mockResolvedValue({ crn: 'crn', type: 'NONE' })
    })
    describe('GETs', () => {
      it('should allow access create a licence page', () => {
        return request(app).get('/licence/create/nomisId/A1234BC/confirm').expect(200)
      })

      it('should allow access the additional licence conditions question', () => {
        return request(app).get('/licence/create/id/1/additional-licence-conditions-question').expect(200)
      })

      it('should allow access the additional PSS conditions question', () => {
        return request(app).get('/licence/create/id/1/additional-pss-conditions-question').expect(200)
      })

      it('should allow access the bespoke conditions question', () => {
        return request(app).get('/licence/create/id/1/bespoke-conditions-question').expect(200)
      })

      it('should allow access the edit question', () => {
        licenceService.getLicence.mockResolvedValue({
          nomsId: 'A1234BC',
          isInHardStopPeriod: false,
          probationTeamCode: 'ABC123',
          kind: 'CRD',
          id: 1,
          statusCode: 'SUBMITTED',
        } as Licence)

        return request(app).get('/licence/create/id/1/edit').expect(200)
      })

      it('should allow access to check your answers page', () => {
        return request(app).get('/licence/create/id/1/check-your-answers').expect(200)
      })
    })

    describe('POSTs', () => {
      it('should redirect to initial-appointment-meeting-name page when confirming licence creation', () => {
        return request(app)
          .post('/licence/create/nomisId/A1234BC/confirm')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/licence/create/id/1/initial-meeting-name')
      })

      it('should redirect condition selection page when answering the additional licence conditions question', () => {
        return request(app)
          .post('/licence/create/id/1/additional-licence-conditions-question')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/licence/create/id/1/additional-licence-conditions')
      })

      it('should redirect to PSS condition selection page when answering the additional PSS conditions question', () => {
        return request(app)
          .post('/licence/create/id/1/additional-pss-conditions-question')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/licence/create/id/1/additional-pss-conditions')
      })

      it('should redirect to bespoke condition entry page when answering the bespoke conditions question', () => {
        return request(app)
          .post('/licence/create/id/1/bespoke-conditions-question')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/licence/create/id/1/bespoke-conditions')
      })

      it('should redirect to CYA page when successfully answering the edit question', () => {
        licenceService.getLicence.mockResolvedValue({
          nomsId: 'A1234BC',
          isInHardStopPeriod: false,
          probationTeamCode: 'ABC123',
          kind: 'CRD',
          id: 1,
          statusCode: 'SUBMITTED',
        } as Licence)

        return request(app)
          .post('/licence/create/id/1/edit')
          .send({ answer: 'Yes' })
          .expect(302)
          .expect('Location', '/licence/create/id/1/check-your-answers')
      })

      it('should redirect to confirmation page when submitting a licence via CYA page', () => {
        return request(app)
          .post('/licence/create/id/1/check-your-answers')
          .expect(302)
          .expect('Location', '/licence/create/id/1/confirmation')
      })
    })
  })
})
