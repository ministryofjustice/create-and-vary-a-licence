// import { Request, Response } from 'express'
//
// import CaseloadRoutes from './caseload'
// import LicenceService from '../../../services/licenceService'
// import CaseloadService from '../../../services/caseloadService'
// import { CaseTypeAndStatus } from '../../../@types/managedCase'
// import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
// import statusConfig from '../../../licences/licenceStatus'
// import config from '../../../config'
// import LicenceStatus from '../../../enumeration/licenceStatus'
// import LicenceType from '../../../enumeration/licenceType'
//
// const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
// const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
//
// jest.mock('../../../services/licenceService')
// jest.mock('../../../services/caseloadService')
//
// describe('Route Handlers - Create Licence - Caseload', () => {
//   const handler = new CaseloadRoutes(licenceService, caseloadService)
//   let req: Request
//   let res: Response
//
//   beforeEach(() => {
//     caseloadService.getStaffCreateCaseload.mockResolvedValue([
//       {
//         deliusRecord: {
//           offenderCrn: 'X381306',
//         },
//         nomisRecord: {
//           firstName: 'Joe',
//           lastName: 'Rogan',
//           conditionalReleaseDate: '2022-10-12',
//           prisonerNumber: '123',
//           prisonId: 'MDI',
//         },
//         licenceStatus: LicenceStatus.IN_PROGRESS,
//         licenceType: LicenceType.AP,
//       },
//     ] as unknown as CaseTypeAndStatus[])
//
//     caseloadService.getTeamCreateCaseload.mockResolvedValue([
//       {
//         deliusRecord: {
//           offenderCrn: 'X381306',
//           staff: {
//             forenames: 'Sherlock',
//             surname: 'Holmes',
//           },
//           staffIdentifier: 3000,
//         },
//         nomisRecord: {
//           firstName: 'Joe',
//           lastName: 'Rogan',
//           conditionalReleaseDate: '2022-10-12',
//           prisonerNumber: '123',
//           prisonId: 'MDI',
//         },
//         licenceStatus: LicenceStatus.IN_PROGRESS,
//         licenceType: LicenceType.AP,
//       },
//       {
//         deliusRecord: {
//           offenderCrn: 'X381307',
//           staff: {
//             unallocated: true,
//           },
//         },
//         nomisRecord: {
//           firstName: 'Dr',
//           lastName: 'Who',
//           conditionalReleaseDate: '2023-10-12',
//           prisonerNumber: '124',
//           prisonId: 'LEI',
//         },
//         licenceStatus: LicenceStatus.IN_PROGRESS,
//         licenceType: LicenceType.AP_PSS,
//       },
//     ] as unknown as CaseTypeAndStatus[])
//   })
//
//   afterEach(() => {
//     jest.resetAllMocks()
//   })
//
//   describe('GET', () => {
//     beforeEach(() => {
//       req = {
//         query: {},
//       } as Request
//
//       res = {
//         render: jest.fn(),
//         locals: {
//           user: {
//             firstName: 'Joe',
//             lastName: 'Bloggs',
//             username: 'USER1',
//             deliusStaffIdentifier: 2000,
//           },
//         },
//       } as unknown as Response
//     })
//
//     it('should render view with My Cases tab selected', async () => {
//       await handler.GET(req, res)
//       expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
//         caseload: [
//           {
//             name: 'Joe Rogan',
//             crnNumber: 'X381306',
//             conditionalReleaseDate: '12 Oct 2022',
//             prisonerNumber: '123',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP,
//             probationPractitioner: {
//               name: 'Joe Bloggs',
//               staffId: 2000,
//             },
//             insidePilot: true,
//           },
//         ],
//         statusConfig,
//         teamView: false,
//       })
//       expect(caseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(caseloadService.getTeamCreateCaseload).not.toHaveBeenCalled()
//     })
//
//     it('should render view with Team Cases tab selected', async () => {
//       req.query = { view: 'team' }
//
//       await handler.GET(req, res)
//       expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
//         caseload: [
//           {
//             name: 'Joe Rogan',
//             crnNumber: 'X381306',
//             conditionalReleaseDate: '12 Oct 2022',
//             prisonerNumber: '123',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP,
//             probationPractitioner: {
//               name: 'Sherlock Holmes',
//               staffId: 3000,
//             },
//             insidePilot: true,
//           },
//           {
//             name: 'Dr Who',
//             crnNumber: 'X381307',
//             conditionalReleaseDate: '12 Oct 2023',
//             prisonerNumber: '124',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP_PSS,
//             probationPractitioner: null,
//             insidePilot: true,
//           },
//         ],
//         statusConfig,
//         teamView: true,
//       })
//       expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
//     })
//
//     it('should successfully search by CRN', async () => {
//       req.query = { view: 'team', search: 'x381307' }
//
//       await handler.GET(req, res)
//       expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
//         caseload: [
//           {
//             name: 'Dr Who',
//             crnNumber: 'X381307',
//             conditionalReleaseDate: '12 Oct 2023',
//             prisonerNumber: '124',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP_PSS,
//             probationPractitioner: null,
//             insidePilot: true,
//           },
//         ],
//         statusConfig,
//         teamView: true,
//         search: 'x381307',
//       })
//       expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
//     })
//
//     it('should successfully search by probation practitioner', async () => {
//       req.query = { view: 'team', search: 'holmes' }
//
//       await handler.GET(req, res)
//       expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
//         caseload: [
//           {
//             name: 'Joe Rogan',
//             crnNumber: 'X381306',
//             conditionalReleaseDate: '12 Oct 2022',
//             prisonerNumber: '123',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP,
//             probationPractitioner: {
//               name: 'Sherlock Holmes',
//               staffId: 3000,
//             },
//             insidePilot: true,
//           },
//         ],
//         statusConfig,
//         teamView: true,
//         search: 'holmes',
//       })
//       expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
//     })
//
//     it('should successfully search by offender name', async () => {
//       req.query = { view: 'team', search: 'rogan' }
//
//       await handler.GET(req, res)
//       expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
//         caseload: [
//           {
//             name: 'Joe Rogan',
//             crnNumber: 'X381306',
//             conditionalReleaseDate: '12 Oct 2022',
//             prisonerNumber: '123',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP,
//             probationPractitioner: {
//               name: 'Sherlock Holmes',
//               staffId: 3000,
//             },
//             insidePilot: true,
//           },
//         ],
//         statusConfig,
//         teamView: true,
//         search: 'rogan',
//       })
//       expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
//     })
//
//     it('should identify offenders outside the pilot areas for the single officer view', async () => {
//       config.rollout.restricted = true
//       config.rollout.prisons = ['LEI']
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
//         caseload: [
//           {
//             name: 'Joe Rogan',
//             crnNumber: 'X381306',
//             conditionalReleaseDate: '12 Oct 2022',
//             prisonerNumber: '123',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP,
//             probationPractitioner: {
//               name: 'Joe Bloggs',
//               staffId: 2000,
//             },
//             insidePilot: false,
//           },
//         ],
//         statusConfig,
//         teamView: false,
//       })
//       expect(caseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(caseloadService.getTeamCreateCaseload).not.toHaveBeenCalled()
//     })
//
//     it('should identify offenders outside the rollout pilot for the team view', async () => {
//       req.query = { view: 'team' }
//       config.rollout.restricted = true
//       config.rollout.prisons = ['MDI']
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
//         caseload: [
//           {
//             name: 'Joe Rogan',
//             crnNumber: 'X381306',
//             conditionalReleaseDate: '12 Oct 2022',
//             prisonerNumber: '123',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP,
//             probationPractitioner: {
//               name: 'Sherlock Holmes',
//               staffId: 3000,
//             },
//             insidePilot: true,
//           },
//           {
//             name: 'Dr Who',
//             crnNumber: 'X381307',
//             conditionalReleaseDate: '12 Oct 2023',
//             prisonerNumber: '124',
//             licenceStatus: LicenceStatus.IN_PROGRESS,
//             licenceType: LicenceType.AP_PSS,
//             probationPractitioner: null,
//             insidePilot: false,
//           },
//         ],
//         statusConfig,
//         teamView: true,
//       })
//       expect(caseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(caseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
//     })
//   })
//
//   describe('POST', () => {
//     beforeEach(() => {
//       req = {
//         body: {
//           prisonerNumber: '123',
//         },
//       } as Request
//
//       res = {
//         redirect: jest.fn(),
//         locals: {
//           user: {
//             username: 'USER1',
//           },
//         },
//       } as unknown as Response
//       licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
//     })
//
//     it('should redirect to check your answers page if the selected person already has a licence', async () => {
//       licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
//         { licenceId: 1 },
//         { licenceId: 2 },
//       ] as LicenceSummary[])
//
//       await handler.POST(req, res)
//
//       expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
//       expect(licenceService.createLicence).not.toBeCalled()
//       expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(['123'], [], res.locals.user)
//     })
//
//     it('should create a licence and redirect to the initial meeting screen', async () => {
//       licenceService.createLicence.mockResolvedValue({ licenceId: 1 } as LicenceSummary)
//
//       await handler.POST(req, res)
//       expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-name')
//       expect(licenceService.createLicence).toHaveBeenCalledWith('123', res.locals.user)
//     })
//   })
// })
