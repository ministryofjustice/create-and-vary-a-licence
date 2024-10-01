import ProbationService from './probationService'
import DeliusClient from '../data/deliusClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import { DeliusStaff } from '../@types/deliusClientTypes'

jest.mock('../data/deliusClient')
jest.mock('../data/probationSearchApiClient')

describe('Probation Service', () => {
  const deliusClient = new DeliusClient(null) as jest.Mocked<DeliusClient>
  const probationSearchApiClient = new ProbationSearchApiClient(null) as jest.Mocked<ProbationSearchApiClient>
  const probationService = new ProbationService(deliusClient, probationSearchApiClient)

  it('Get Staff Detail', async () => {
    const expectedResponse = {
      id: 2000,
      email: 'joebloggs@probation.gov.uk',
    } as DeliusStaff

    deliusClient.getStaffDetailByUsername.mockResolvedValue(expectedResponse)

    const actualResult = await probationService.getStaffDetailByUsername('joebloggs')

    expect(actualResult).toEqual(expectedResponse)
    expect(deliusClient.getStaffDetailByUsername).toHaveBeenCalledWith('joebloggs')
  })

  it('Get Staff Detail By Staff Code', async () => {
    const expectedResponse = {
      id: 2000,
      email: 'joebloggs@probation.gov.uk',
    } as DeliusStaff

    deliusClient.getStaffDetailByStaffCode.mockResolvedValue(expectedResponse)

    const actualResult = await probationService.getStaffDetailByStaffCode('X12345')

    expect(actualResult).toEqual(expectedResponse)
    expect(deliusClient.getStaffDetailByStaffCode).toHaveBeenCalledWith('X12345')
  })

  it('Get Staff Detail by Username List', async () => {
    const expectedResponse = [
      {
        id: 2000,
        email: 'joebloggs@probation.gov.uk',
      },
    ] as DeliusStaff[]

    deliusClient.getStaffDetailsByUsernameList.mockResolvedValue(expectedResponse)

    const actualResult = await probationService.getStaffDetailsByUsernameList(['joebloggs'])

    expect(actualResult).toEqual(expectedResponse)
    expect(deliusClient.getStaffDetailsByUsernameList).toHaveBeenCalledWith(['joebloggs'])
  })

  it('should get an offenders managers', async () => {
    await probationService.getResponsibleCommunityManager('X1234')
    expect(deliusClient.getResponsibleCommunityManager).toHaveBeenCalledWith('X1234')
  })

  it('should assign a Delius role', async () => {
    await probationService.assignDeliusRole('X1234')
    expect(deliusClient.assignDeliusRole).toHaveBeenCalledWith('X1234')
  })

  it('should get PDU heads', async () => {
    await probationService.getPduHeads('X1234')
    expect(deliusClient.getPduHeads).toHaveBeenCalledWith('X1234')
  })

  it('Search probationers', async () => {
    const expectedResponse = [
      {
        firstName: 'Joe',
        surname: 'Bloggs',
      },
    ] as OffenderDetail[]

    probationSearchApiClient.searchProbationer.mockResolvedValue(expectedResponse)

    const actualResult = await probationService.searchProbationers({ nomsNumber: 'ABC1234' })

    expect(actualResult).toEqual(expectedResponse)
    expect(probationSearchApiClient.searchProbationer).toHaveBeenCalledWith({ nomsNumber: 'ABC1234' })
  })

  describe('Get probationers', () => {
    it('should throw error when no delius records are found', async () => {
      probationSearchApiClient.searchProbationer.mockResolvedValue([])

      await expect(probationService.getProbationer({ nomsNumber: 'ABC1234' })).rejects.toThrow('No delius record found')
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

      const actualResult = await probationService.getProbationer({ nomsNumber: 'ABC1234' })

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

    const actualResult = await probationService.getOffendersByCrn(['X1234', 'X4321'])

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

    const actualResult = await probationService.getOffendersByNomsNumbers(['B123445', 'C123535'])

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
