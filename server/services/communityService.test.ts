import exp from 'constants'
import CommunityService from './communityService'
import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { User } from '../@types/CvlUserDetails'
import { CommunityApiManagedOffender } from '../@types/communityClientTypes'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'

jest.mock('../data/communityApiClient')
jest.mock('../data/probationSearchApiClient')

describe('Community Service', () => {
  const communityApiClient = new CommunityApiClient() as jest.Mocked<CommunityApiClient>
  const probationSearchApiClient = new ProbationSearchApiClient() as jest.Mocked<ProbationSearchApiClient>
  const communityService = new CommunityService(communityApiClient, probationSearchApiClient)

  const user = { username: 'joebloggs' } as User

  it('Get Staff Detail', async () => {
    const expectedResponse = {
      staffIdentifier: 2000,
      email: 'joebloggs@probation.gov.uk',
    }

    communityApiClient.getStaffDetailByUsername.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getStaffDetail(user)

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getStaffDetailByUsername).toHaveBeenCalledWith(user)
  })

  it('Get Managed Offenders', async () => {
    const expectedResponse = [
      {
        staffIdentifier: 2000,
        nomsNumber: 'ABC123',
      },
    ] as CommunityApiManagedOffender[]

    communityApiClient.getStaffCaseload.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getManagedOffenders(2000)

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getStaffCaseload).toHaveBeenCalledWith(2000)
  })

  it('Search probationers', async () => {
    const expectedResponse = [
      {
        firstName: 'Joe',
        surname: 'Bloggs',
      },
    ] as OffenderDetail[]

    probationSearchApiClient.searchProbationer.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.searchProbationers({ nomsNumber: 'ABC1234' })

    expect(actualResult).toEqual(expectedResponse)
    expect(probationSearchApiClient.searchProbationer).toHaveBeenCalledWith({ nomsNumber: 'ABC1234' })
  })

  describe('Get probationers', () => {
    it('should throw error when no delius records are found', async () => {
      probationSearchApiClient.searchProbationer.mockResolvedValue([])

      await expect(communityService.getProbationer('ABC1234')).rejects.toThrow(
        'No delius record found for nomis ID ABC1234'
      )
      expect(probationSearchApiClient.searchProbationer).toHaveBeenCalledWith({ nomsNumber: 'ABC1234' })
    })

    it('should return the first delius record found', async () => {
      probationSearchApiClient.searchProbationer.mockResolvedValue([
        {
          firstName: 'Joe',
          surname: 'Bloggs',
        },
        {
          firstName: 'John',
          surname: 'Smith',
        },
      ] as OffenderDetail[])

      const actualResult = await communityService.getProbationer('ABC1234')

      expect(actualResult).toEqual({ firstName: 'Joe', surname: 'Bloggs' })
      expect(probationSearchApiClient.searchProbationer).toHaveBeenCalledWith({ nomsNumber: 'ABC1234' })
    })
  })
})
