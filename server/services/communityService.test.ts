import CommunityService from './communityService'
import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { CommunityApiManagedOffender, CommunityApiUserDetails } from '../@types/communityClientTypes'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'

jest.mock('../data/communityApiClient')
jest.mock('../data/probationSearchApiClient')

describe('Community Service', () => {
  const communityApiClient = new CommunityApiClient() as jest.Mocked<CommunityApiClient>
  const probationSearchApiClient = new ProbationSearchApiClient() as jest.Mocked<ProbationSearchApiClient>
  const communityService = new CommunityService(communityApiClient, probationSearchApiClient)

  it('Get Staff Detail', async () => {
    const expectedResponse = {
      staffIdentifier: 2000,
      email: 'joebloggs@probation.gov.uk',
    }

    communityApiClient.getStaffDetailByUsername.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getStaffDetailByUsername('joebloggs')

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getStaffDetailByUsername).toHaveBeenCalledWith('joebloggs')
  })

  it('Get Staff Detail By Staff Identifier', async () => {
    const expectedResponse = {
      staffIdentifier: 2000,
      email: 'joebloggs@probation.gov.uk',
    }

    communityApiClient.getStaffDetailByStaffIdentifier.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getStaffDetailByStaffIdentifier(2000)

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getStaffDetailByStaffIdentifier).toHaveBeenCalledWith(2000)
  })

  it('Get Staff Detail by Username List', async () => {
    const expectedResponse = [
      {
        staffIdentifier: 2000,
        email: 'joebloggs@probation.gov.uk',
      },
    ]

    communityApiClient.getStaffDetailsByUsernameList.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getStaffDetailsByUsernameList(['joebloggs'])

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getStaffDetailsByUsernameList).toHaveBeenCalledWith(['joebloggs'])
  })

  it('Get Staff Detail by Staff Code List', async () => {
    const expectedResponse = [
      {
        staffIdentifier: 2000,
        email: 'joebloggs@probation.gov.uk',
      },
    ]

    communityApiClient.getStaffDetailByStaffCodeList.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getStaffDetailByStaffCodeList(['X1234'])

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getStaffDetailByStaffCodeList).toHaveBeenCalledWith(['X1234'])
  })

  it('Get Managed Offenders', async () => {
    const expectedResponse = [
      {
        staffIdentifier: 2000,
        offenderCrn: 'ABC123',
      },
    ] as CommunityApiManagedOffender[]

    communityApiClient.getStaffCaseload.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getManagedOffenders(2000)

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getStaffCaseload).toHaveBeenCalledWith(2000)
  })

  it('Get Managed Offenders By Team', async () => {
    const expectedResponse = [
      {
        staffIdentifier: 2000,
        offenderCrn: 'ABC123',
      },
    ] as CommunityApiManagedOffender[]

    communityApiClient.getTeamCaseload.mockResolvedValue(expectedResponse)

    const actualResult = await communityService.getManagedOffendersByTeam('teamA')

    expect(actualResult).toEqual(expectedResponse)
    expect(communityApiClient.getTeamCaseload).toHaveBeenCalledWith('teamA')
  })

  it('should get an offenders managers', async () => {
    await communityService.getAnOffendersManagers('X1234')
    expect(communityApiClient.getAnOffendersManagers).toHaveBeenCalledWith('X1234')
  })

  it('should get Delius user details', async () => {
    const expectedResponse = {
      username: 'X1234',
      email: 'x.y@mail.com',
      enabled: true,
      firstName: 'Bob',
      surname: 'Adams',
      userId: 1,
      roles: [{ name: 'ROLE_NAME' }],
    } as CommunityApiUserDetails

    communityApiClient.getUserDetailsByUsername.mockResolvedValue(expectedResponse)

    const response = await communityService.getUserDetailsByUsername('X1234')

    expect(communityApiClient.getUserDetailsByUsername).toHaveBeenCalledWith('X1234')
    expect(response).toEqual(expectedResponse)
  })

  it('should assign a Delius role', async () => {
    await communityService.assignDeliusRole('X1234', 'ROLE_ID')
    expect(communityApiClient.assignDeliusRole).toHaveBeenCalledWith('X1234', 'ROLE_ID')
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

      await expect(communityService.getProbationer({ nomsNumber: 'ABC1234' })).rejects.toThrow('No delius record found')
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

      const actualResult = await communityService.getProbationer({ nomsNumber: 'ABC1234' })

      expect(actualResult).toEqual({ firstName: 'Joe', surname: 'Bloggs' })
      expect(probationSearchApiClient.searchProbationer).toHaveBeenCalledWith({ nomsNumber: 'ABC1234' })
    })
  })

  it('should call api client to search by crns', async () => {
    probationSearchApiClient.getOffendersByCrn.mockResolvedValue([
      {
        firstName: 'Joe',
        surname: 'Bloggs',
      },
      {
        firstName: 'John',
        surname: 'Smith',
      },
    ] as OffenderDetail[])

    const actualResult = await communityService.getOffendersByCrn(['X1234', 'X4321'])

    expect(actualResult).toEqual([
      {
        firstName: 'Joe',
        surname: 'Bloggs',
      },
      {
        firstName: 'John',
        surname: 'Smith',
      },
    ])
    expect(probationSearchApiClient.getOffendersByCrn).toHaveBeenCalledWith(['X1234', 'X4321'])
  })

  it('should call api client to search by nomsNumbers', async () => {
    probationSearchApiClient.getOffendersByNomsNumbers.mockResolvedValue([
      {
        firstName: 'Joe',
        surname: 'Bloggs',
      },
      {
        firstName: 'John',
        surname: 'Smith',
      },
    ] as OffenderDetail[])

    const actualResult = await communityService.getOffendersByNomsNumbers(['B123445', 'C123535'])

    expect(actualResult).toEqual([
      {
        firstName: 'Joe',
        surname: 'Bloggs',
      },
      {
        firstName: 'John',
        surname: 'Smith',
      },
    ])
    expect(probationSearchApiClient.getOffendersByNomsNumbers).toHaveBeenCalledWith(['B123445', 'C123535'])
  })
})
