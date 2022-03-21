// import { Request, Response } from 'express'
//
// import ViewAndPrintCaseRoutes from './viewCases'
// import LicenceStatus from '../../../enumeration/licenceStatus'
// import statusConfig from '../../../licences/licenceStatus'
// import CaseloadService from '../../../services/caseloadService'
//
// const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
//
// jest.mock('../../../services/caseloadService')
//
// describe('Route handlers - View and print case list', () => {
//   const handler = new ViewAndPrintCaseRoutes(caseloadService)
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
//       locals: {
//         user: {
//           username: 'joebloggs',
//         },
//       },
//     } as unknown as Response
//
//     caseloadService.getOmuCaseload.mockResolvedValue([
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
//     it('should render list of licences', async () => {
//       await handler.GET(req, res)
//
//       expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith({ username: 'joebloggs' })
//       expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             licenceStatus: LicenceStatus.SUBMITTED,
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//           {
//             licenceId: 2,
//             name: 'Matthew Baker',
//             prisonNumber: 'A1234AB',
//             licenceStatus: LicenceStatus.SUBMITTED,
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Stephen Hawking',
//           },
//         ],
//         statusConfig,
//       })
//     })
//
//     it('should successfully search by name', async () => {
//       req.query.search = 'bob'
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             licenceStatus: LicenceStatus.SUBMITTED,
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//         ],
//         search: 'bob',
//         statusConfig,
//       })
//     })
//
//     it('should successfully search by prison number', async () => {
//       req.query.search = 'A1234AA'
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             licenceStatus: LicenceStatus.SUBMITTED,
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//         ],
//         search: 'A1234AA',
//         statusConfig,
//       })
//     })
//
//     it('should successfully search by probation practitioner', async () => {
//       req.query.search = 'rogan'
//
//       await handler.GET(req, res)
//
//       expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
//         cases: [
//           {
//             licenceId: 1,
//             name: 'Bob Smith',
//             prisonNumber: 'A1234AA',
//             licenceStatus: LicenceStatus.SUBMITTED,
//             releaseDate: '01 May 2022',
//             probationPractitioner: 'Joe Rogan',
//           },
//         ],
//         search: 'rogan',
//         statusConfig,
//       })
//     })
//   })
// })
