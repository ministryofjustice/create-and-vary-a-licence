// import nock from 'nock'
// import config from '../config'
// import PrisonerService from '../services/prisonerService'
// import HmppsAuthClient from './hmppsAuthClient'
// import {
//   HomeDetentionCurfew,
//   PrisonApiCaseload,
//   PrisonApiPrisoner,
//   PrisonApiSentenceDetail,
//   PrisonApiUserDetail,
//   PrisonInformation,
// } from '../@types/prisonApiClientTypes'
// import PrisonApiClient from './prisonApiClient'
// import UserService from '../services/userService'
// import CommunityService from '../services/communityService'
// import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
//
// jest.mock('./hmppsAuthClient')
// jest.mock('../services/communityService')
//
// const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
// const communityService = new CommunityService(hmppsAuthClient) as jest.Mocked<CommunityService>
//
// const prisonerService = new PrisonerService(hmppsAuthClient)
// let prisonApiClient: PrisonApiClient
// let userService: UserService
//
// describe('Prison API client tests', () => {
//   let fakeApi: nock.Scope
//
//   beforeEach(() => {
//     config.apis.prisonApi.url = 'http://localhost:8100'
//     fakeApi = nock(config.apis.prisonApi.url)
//     prisonApiClient = new PrisonApiClient()
//     userService = new UserService(hmppsAuthClient, prisonApiClient, communityService)
//   })
//
//   afterEach(() => {
//     nock.cleanAll()
//   })
//
//   describe('Prisoner detail - admin token', () => {
//     const stubbedPrisonerData = {
//       offenderNo: 'A1234AA',
//       firstName: 'Ringo',
//       lastName: 'Starr',
//       latestLocationId: 'LEI',
//       locationDescription: 'Inside - Leeds HMP',
//       dateOfBirth: '24/06/2000',
//       age: 21,
//       activeFlag: true,
//       legalStatus: 'REMAND',
//       category: 'Cat C',
//       imprisonmentStatus: 'LIFE',
//       imprisonmentStatusDescription: 'Serving Life Imprisonment',
//       religion: 'Christian',
//       sentenceDetail: {
//         sentenceStartDate: '12/12/2019',
//         additionalDaysAwarded: 4,
//         tariffDate: '12/12/2030',
//         releaseDate: '12/12/2028',
//         conditionalReleaseDate: '12/12/2025',
//         confirmedReleaseDate: '12/12/2026',
//         sentenceExpiryDate: '16/12/2030',
//         licenceExpiryDate: '16/12/2030',
//       } as PrisonApiSentenceDetail,
//     } as PrisonApiPrisoner
//
//     it('Get prisoner detail', async () => {
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.get('/api/offenders/AA1234A', '').reply(200, stubbedPrisonerData)
//       const data = await prisonerService.getPrisonerDetail('XTEST1', 'AA1234A')
//       expect(data).toEqual(stubbedPrisonerData)
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//
//     it('Prisoner detail - error no admin token', async () => {
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
//       fakeApi.get('/api/offenders/AA1234A', '').reply(401)
//       try {
//         await prisonerService.getPrisonerDetail('XTEST1', 'AA1234A')
//       } catch (e) {
//         expect(e.message).toContain('Unauthorized')
//       }
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//
//     it('Prisoner detail - not found', async () => {
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.get('/api/offenders/AA1234A', '').reply(404)
//       try {
//         await prisonerService.getPrisonerDetail('XTEST1', 'AA1234A')
//       } catch (e) {
//         expect(e.message).toContain('Not Found')
//       }
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//   })
//
//   describe('Prison information - admin token', () => {
//     const stubbedPrisonData = {
//       addressType: 'BUS',
//       agencyId: 'MDI',
//       agencyType: 'INST',
//       description: 'Moorland (HMP)',
//       formattedDescription: 'Moorland (HMP)',
//     } as PrisonInformation
//
//     it('Get prison information', async () => {
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.get('/api/agencies/prison/MDI').reply(200, stubbedPrisonData)
//       const result = await prisonerService.getPrisonInformation('XTEST1', 'MDI')
//       expect(result.agencyId).toEqual('MDI')
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//   })
//
//   describe('Prisoner detail - access with user token', () => {
//     const stubbedPrisonUserData = {
//       accountStatus: 'ACTIVE',
//       active: true,
//       activeCaseLoadId: 'MDI',
//       expiredFlag: false,
//       firstName: 'Robert',
//       lastName: 'Charles',
//       lockedFlag: false,
//       staffId: 123,
//       thumbnailId: 345,
//       username: 'RCHARLES',
//     } as PrisonApiUserDetail
//
//     it('Get /api/users/me', async () => {
//       fakeApi.get('/api/users/me').reply(200, stubbedPrisonUserData)
//       const result = await userService.getPrisonUser('a token')
//       expect(result.activeCaseLoadId).toEqual('MDI')
//       expect(result.staffId).toEqual(123)
//       expect(result.firstName).toEqual('Robert')
//       expect(result.lastName).toEqual('Charles')
//       expect(nock.isDone()).toBe(true)
//     })
//
//     const stubbedPrisonCaseloadData: PrisonApiCaseload[] = [
//       {
//         caseLoadId: 'MDI',
//         caseloadFunction: 'GENERAL',
//         currentlyActive: true,
//         description: 'Moorland (HMP)',
//         type: 'INST',
//       },
//       {
//         caseLoadId: 'LEI',
//         caseloadFunction: 'GENERAL',
//         currentlyActive: true,
//         description: 'Leeds (HMP)',
//         type: 'INST',
//       },
//     ]
//
//     it('Get /api/users/me/caseLoads', async () => {
//       fakeApi.get('/api/users/me/caseLoads').reply(200, stubbedPrisonCaseloadData)
//       const result = await userService.getPrisonUserCaseloads('a token')
//       expect(result[0].caseLoadId).toContain('MDI')
//       expect(result[1].caseLoadId).toContain('LEI')
//       expect(nock.isDone()).toBe(true)
//     })
//   })
//
//   describe('Prisoner image', () => {
//     it('Get prisoner image - streamed', async () => {
//       const bodyContent = ['-- a photograph --']
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.get('/api/bookings/offenderNo/AA1234A/image/data').reply(200, bodyContent)
//       const data = await prisonerService.getPrisonerImage('XTEST1', 'AA1234A')
//       const content = data.read(20)
//       expect(content).toEqual(bodyContent)
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//
//     it('Get prisoner image - base64 string', async () => {
//       const bufferResponse = Buffer.from([1, 2, 3] as unknown as Uint8Array)
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.get('/api/bookings/offenderNo/AA1234A/image/data').reply(200, bufferResponse)
//       const data = await prisonerService.getPrisonerImageData('XTEST1', 'AA1234A')
//       expect(data).toEqual(bufferResponse.toString('base64'))
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//
//     it('Get prisoner image - replace with placeholder file - base64 string', async () => {
//       const errorResponse = {}
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.get('/api/bookings/offenderNo/AA1234A/image/data').reply(404, errorResponse)
//       const data = await prisonerService.getPrisonerImageData('XTEST1', 'AA1234A')
//       // Matches the first few characters of the encoded missing image placeholder
//       expect(data).toContain('iVBORw0KGgoAAAA')
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//   })
//
//   describe('HDC status checks', () => {
//     const okResponse = {
//       approvalStatus: 'APPROVED',
//       approvalStatusDate: '12/12/2022',
//       checksPassedDate: '12/12/2022',
//       passed: true,
//       bookingId: 1,
//     } as HomeDetentionCurfew
//
//     const offenderList = [{ bookingId: '1', homeDetentionCurfewEligibilityDate: '2023-06-12' }] as Prisoner[]
//
//     it('Check for HDC eligible', async () => {
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.post('/api/offender-sentences/home-detention-curfews/latest').reply(200, [okResponse])
//       const result = await prisonerService.getHdcStatuses('XTEST1', offenderList)
//       expect(result).toHaveLength(1)
//       expect(result[0].eligibleForHdc).toBe(true)
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//
//     it('Check for HDC status returning empty list', async () => {
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       fakeApi.post('/api/offender-sentences/home-detention-curfews/latest').reply(200, [])
//       const result = await prisonerService.getHdcStatuses('XTEST1', offenderList)
//       expect(result).toHaveLength(0)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//       expect(nock.isDone()).toBe(true)
//     })
//
//     it('Check for HDC status found but REJECTED', async () => {
//       hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
//       const rejectResponse = { ...okResponse, approvalStatus: 'REJECTED' }
//       fakeApi.post('/api/offender-sentences/home-detention-curfews/latest').reply(200, [rejectResponse])
//       const result = await prisonerService.getHdcStatuses('XTEST1', offenderList)
//       expect(result).toHaveLength(1)
//       expect(result[0].eligibleForHdc).toBe(false)
//       expect(nock.isDone()).toBe(true)
//       expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
//     })
//   })
// })
