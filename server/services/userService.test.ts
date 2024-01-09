import UserService from './userService'
import ManageUsersApiClient, { PrisonUserEmail, PrisonUserDetails } from '../data/manageUsersApiClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import CommunityService from './communityService'
import { CommunityApiStaffDetails } from '../@types/communityClientTypes'
import { User } from '../@types/CvlUserDetails'

jest.mock('../data/manageUsersApiClient')
jest.mock('../data/prisonApiClient')
jest.mock('./communityService')

const user = { token: 'some token' } as User

describe('User service', () => {
  let manageUsersApiClient: jest.Mocked<ManageUsersApiClient>
  let prisonApiClient: jest.Mocked<PrisonApiClient>
  let communityService: jest.Mocked<CommunityService>
  let userService: UserService

  beforeEach(() => {
    manageUsersApiClient = new ManageUsersApiClient(null) as jest.Mocked<ManageUsersApiClient>
    prisonApiClient = new PrisonApiClient(null) as jest.Mocked<PrisonApiClient>
    communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
    userService = new UserService(manageUsersApiClient, prisonApiClient, communityService)
  })

  describe('getUser', () => {
    it('Retrieves user name and active caseload', async () => {
      manageUsersApiClient.getUser.mockResolvedValue({
        name: 'john smith',
        activeCaseLoadId: 'MDI',
      } as PrisonUserDetails)
      const result = await userService.getUser(user)
      expect(result.name).toEqual('john smith')
      expect(result.activeCaseLoadId).toEqual('MDI')
      expect(manageUsersApiClient.getUser).toBeCalled()
    })

    it('Propagates any errors', async () => {
      manageUsersApiClient.getUser.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getUser(user)).rejects.toThrow('some error')
      expect(manageUsersApiClient.getUser).toBeCalled()
    })
  })

  describe('getUserEmail', () => {
    it('Retrieves user email', async () => {
      manageUsersApiClient.getUserEmail.mockResolvedValue({
        username: 'JSMITH',
        email: 'js@prison.com',
        verified: true,
      } as PrisonUserEmail)
      const result = await userService.getUserEmail(user)
      expect(result.email).toEqual('js@prison.com')
      expect(manageUsersApiClient.getUserEmail).toBeCalled()
    })

    it('Propagates any errors', async () => {
      manageUsersApiClient.getUserEmail.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getUserEmail(user)).rejects.toThrow('some error')
      expect(manageUsersApiClient.getUserEmail).toBeCalled()
    })
  })

  describe('getPrisonUser', () => {
    it('Retrieves prison user details', async () => {
      prisonApiClient.getUser.mockResolvedValue({
        accountStatus: 'ACTIVE',
        active: true,
        activeCaseLoadId: 'MDI',
        expiredFlag: false,
        firstName: 'Robert',
        lastName: 'Charles',
        lockedFlag: false,
        staffId: 123,
        username: 'RCHARLES',
      } as PrisonApiUserDetail)
      const result = await userService.getPrisonUser(user)
      expect(result.firstName).toEqual('Robert')
      expect(result.lastName).toEqual('Charles')
      expect(result.staffId).toEqual(123)
      expect(result.activeCaseLoadId).toEqual('MDI')
      expect(prisonApiClient.getUser).toBeCalled()
    })

    it('Propagates any errors', async () => {
      prisonApiClient.getUser.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getPrisonUser(user)).rejects.toThrow('some error')
    })
  })

  describe('getPrisonUserCaseloads', () => {
    const stubbedPrisonCaseloadData: PrisonApiCaseload[] = [
      {
        caseLoadId: 'MDI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
        description: 'Moorland (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'LEI',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: 'INST',
      },
      {
        caseLoadId: 'BMI',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
        description: 'Birmingham (HMP)',
        type: 'INST',
      },
    ]

    it('Retrieves prison user caseload details', async () => {
      prisonApiClient.getUserCaseloads.mockResolvedValue(stubbedPrisonCaseloadData)
      const result = await userService.getPrisonUserCaseloads(user)
      const activeCaseload = result.map(cs => cs.caseLoadId)
      expect(activeCaseload).toHaveLength(3)
      expect(activeCaseload[0]).toEqual('MDI')
      expect(activeCaseload[1]).toEqual('LEI')
      expect(activeCaseload[2]).toEqual('BMI')
      expect(prisonApiClient.getUserCaseloads).toBeCalled()
    })

    it('Propagates any errors', async () => {
      prisonApiClient.getUserCaseloads.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getPrisonUserCaseloads(user)).rejects.toThrow('some error')
    })
  })

  describe('getProbationUser', () => {
    it('Retrieves probation user details', async () => {
      communityService.getStaffDetailByUsername.mockResolvedValue({
        email: 'test@test.com',
        staff: { forenames: 'Test test', surname: 'Test' },
        staffCode: 'X400',
        staffIdentifier: 1234,
        telephoneNumber: '0111 1111111',
        username: 'TestUserNPS',
      } as CommunityApiStaffDetails)

      const result = await userService.getProbationUser(user)

      expect(result.email).toEqual('test@test.com')
      expect(result.staff.forenames).toEqual('Test test')
      expect(result.staff.surname).toEqual('Test')
      expect(result.staffIdentifier).toEqual(1234)
      expect(result.username).toEqual('TestUserNPS')
      expect(communityService.getStaffDetailByUsername).toBeCalled()
    })

    it('Propagates any errors', async () => {
      communityService.getStaffDetailByUsername.mockRejectedValue(new Error('some error'))
      await expect(() => userService.getProbationUser(user)).rejects.toThrow('some error')
    })
  })
})
