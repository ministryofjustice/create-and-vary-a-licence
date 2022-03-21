// import { Request, Response } from 'express'
//
// import ApprovalCaseRoutes from './approvalCases'
// import CaseloadService from '../../../services/caseloadService'
// import LicenceStatus from '../../../enumeration/licenceStatus'
//
// const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
// jest.mock('../../../services/caseloadService')
//
// const username = 'joebloggs'
//
// describe('Route Handlers - Approval - case list', () => {
//   const handler = new ApprovalCaseRoutes(caseloadService)
//   let req: Request
//   let res: Response
//
//   beforeEach(() => {
//     req = {
//       body: {
//         licenceId: '1',
//       },
//       query: {},
//     } as unknown as Request
//
//     res = {
//       render: jest.fn(),
//       redirect: jest.fn(),
//       locals: {
//         user: {
//           username,
//           prisonCaseload: ['MDI', 'LEI', 'BMI'],
//         },
//       },
//     } as unknown as Response
//
//     caseloadService.getApproverCaseload.mockResolvedValue([
//       {
//         licenceId: 1,
//         licenceType: 'AP',
//         surname: 'Smith',
//         forename: 'Bob',
//         nomisId: 'A1234AA',
//         licenceStatus: LicenceStatus.SUBMITTED,
//         prisonDescription: 'Moorland (HMP)',
//         conditionalReleaseDate: '01/05/2022',
//         comFirstName: 'Joe',
//         comLastName: 'Rogan',
//       },
//       {
//         licenceId: 2,
//         licenceType: 'AP',
//         surname: 'Baker',
//         forename: 'Matthew',
//         nomisId: 'A1234AB',
//         licenceStatus: LicenceStatus.SUBMITTED,
//         prisonDescription: 'Moorland (HMP)',
//         conditionalReleaseDate: '01/05/2022',
//         comFirstName: 'Stephen',
//         comLastName: 'Hawking',
//       },
//     ])
//   })
//
//   afterEach(() => {
//     jest.resetAllMocks()
//   })
//
//   describe('GET', () => {
//     it('should render list of licences for approval', async () => {
//       await handler.GET(req, res)
//       expect(caseloadService.getApproverCaseload).toHaveBeenCalledWith(res.locals.user)
//       expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//           {
//             licenceId: 2,
//             name: 'Matthew Baker',
//             prisonNumber: 'A1234AB',
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Stephen Hawking',
//           },
//         ],
//       })
//     })
//
//     it('should successfully search by name', async () => {
//       req.query.search = 'bob'
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//         ],
//         search: 'bob',
//       })
//     })
//
//     it('should successfully search by prison number', async () => {
//       req.query.search = 'A1234AA'
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//         ],
//         search: 'A1234AA',
//       })
//     })
//
//     it('should successfully search by probation practitioner', async () => {
//       req.query.search = 'rogan'
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//         ],
//         search: 'rogan',
//       })
//     })
//   })
// })
