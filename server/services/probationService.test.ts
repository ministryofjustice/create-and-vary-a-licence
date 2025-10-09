import ProbationService from './probationService'
import DeliusClient from '../data/deliusClient'
import { DeliusStaff } from '../@types/deliusClientTypes'

jest.mock('../data/deliusClient')

describe('Probation Service', () => {
  const deliusClient = new DeliusClient(null) as jest.Mocked<DeliusClient>
  const probationService = new ProbationService(deliusClient)

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

  describe('Get probationers', () => {
    it('should throw error when no delius records are found', async () => {
      deliusClient.getCase.mockResolvedValue(null)

      await expect(probationService.getProbationer('ABC1234')).rejects.toThrow('No delius record found')
      expect(deliusClient.getCase).toHaveBeenCalledWith('ABC1234')
    })

    it('should return the first delius record found', async () => {
      deliusClient.getCase.mockResolvedValue({ crn: 'X123456' })

      const actualResult = await probationService.getProbationer('ABC1234')

      expect(actualResult).toEqual({ crn: 'X123456' })
      expect(deliusClient.getCase).toHaveBeenCalledWith('ABC1234')
    })
  })

  it('should call api client to search multiple cases', async () => {
    deliusClient.getCases.mockResolvedValue([
      { crn: 'X1234', nomisId: 'A' },
      { crn: 'X4321', nomisId: 'B' },
    ])

    const actualResult = await probationService.getProbationers(['X1234', 'X4321'])

    expect(actualResult).toEqual([
      { crn: 'X1234', nomisId: 'A' },
      { crn: 'X4321', nomisId: 'B' },
    ])
    expect(deliusClient.getCases).toHaveBeenCalledWith(['X1234', 'X4321'])
  })
})
