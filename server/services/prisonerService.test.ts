import { Readable } from 'stream'
import fs from 'fs'
import { User } from '../@types/CvlUserDetails'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import PrisonerService from './prisonerService'
import { HomeDetentionCurfew, PrisonApiPrisoner, PrisonInformation } from '../@types/prisonApiClientTypes'
import { PagePrisoner, Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'

jest.mock('fs')
jest.mock('../data/prisonApiClient')
jest.mock('../data/prisonerSearchApiClient')
jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('placeholder image'))

describe('Prisoner Service', () => {
  const prisonApiClient = new PrisonApiClient() as jest.Mocked<PrisonApiClient>
  const prisonerSearchApiClient = new PrisonerSearchApiClient() as jest.Mocked<PrisonerSearchApiClient>
  const prisonerService = new PrisonerService(prisonApiClient, prisonerSearchApiClient)

  const user = { username: 'joebloggs' } as User

  it('Get Prisoner Image', async () => {
    prisonApiClient.getPrisonerImage.mockResolvedValue(Readable.from('image'))

    const actualResult = await prisonerService.getPrisonerImage('ABC1234', user)

    expect(actualResult.read()).toEqual('image')
    expect(prisonApiClient.getPrisonerImage).toHaveBeenCalledWith('ABC1234', user)
  })

  describe('Get Prisoner Image as base64', () => {
    it('should get the image as base64 encoded string', async () => {
      prisonApiClient.getPrisonerImageData.mockResolvedValue(Buffer.from('image'))

      const actualResult = await prisonerService.getPrisonerImageData('ABC1234', user)

      expect(actualResult).toEqual(Buffer.from('image').toString('base64'))
      expect(prisonApiClient.getPrisonerImageData).toHaveBeenCalledWith('ABC1234', user)
    })

    it('should get placeholder as base64 encoded string if image for prisoner does not exist', async () => {
      prisonApiClient.getPrisonerImageData.mockRejectedValue('not found')

      const actualResult = await prisonerService.getPrisonerImageData('ABC1234', user)

      expect(actualResult).toEqual(Buffer.from('placeholder image').toString('base64'))
      expect(prisonApiClient.getPrisonerImageData).toHaveBeenCalledWith('ABC1234', user)
    })
  })

  it('Get Prisoner Detail', async () => {
    const expectedResult = { firstName: 'Joe', lastName: 'Bloggs' } as PrisonApiPrisoner

    prisonApiClient.getPrisonerDetail.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.getPrisonerDetail('ABC1234', user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonApiClient.getPrisonerDetail).toHaveBeenCalledWith('ABC1234', user)
  })

  it('Get Prison Information', async () => {
    const expectedResult = { agencyId: 'MDI', description: 'Moorland (HMP)' } as PrisonInformation

    prisonApiClient.getPrisonInformation.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.getPrisonInformation('MDI', user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonApiClient.getPrisonInformation).toHaveBeenCalledWith('MDI', user)
  })

  it('Search Prisoners', async () => {
    const expectedResult = [{ firstName: 'Joe', lastName: 'Bloggs' }] as Prisoner[]

    prisonerSearchApiClient.searchPrisoners.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.searchPrisoners({ lastName: 'Bloggs' } as PrisonerSearchCriteria, user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonerSearchApiClient.searchPrisoners).toHaveBeenCalledWith(
      { lastName: 'Bloggs' } as PrisonerSearchCriteria,
      user
    )
  })

  describe('Search Prisoners by nomis ids', () => {
    it('should return an empty list if criteria is empty', async () => {
      const expectedResult = [] as Prisoner[]

      const actualResult = await prisonerService.searchPrisonersByNomisIds([], user)

      expect(actualResult).toEqual(expectedResult)
      expect(prisonerSearchApiClient.searchPrisonersByNomsIds).not.toBeCalled()
    })

    it('should return a list of matching prisoners', async () => {
      const expectedResult = [{ prisonerNumber: 'ABC1234', firstName: 'Joe', lastName: 'Bloggs' }] as Prisoner[]

      prisonerSearchApiClient.searchPrisonersByNomsIds.mockResolvedValue(expectedResult)

      const actualResult = await prisonerService.searchPrisonersByNomisIds(['ABC1234'], user)

      expect(actualResult).toEqual(expectedResult)
      expect(prisonerSearchApiClient.searchPrisonersByNomsIds).toHaveBeenCalledWith(
        { prisonerNumbers: ['ABC1234'] },
        user
      )
    })
  })

  describe('Get HDC statuses', () => {
    it('should return empty list if no booking ids are available', async () => {
      const actualResult = await prisonerService.getHdcStatuses(
        [{ firstName: 'Joe', lastName: 'Bloggs' } as Prisoner],
        user
      )
      expect(actualResult).toEqual([])
      expect(prisonApiClient.getLatestHdcStatusBatch).not.toBeCalled()
    })

    it('should return list of HDC statuses', async () => {
      prisonApiClient.getLatestHdcStatusBatch.mockResolvedValue([
        { bookingId: 123, approvalStatus: 'PASSED', passed: true } as unknown as HomeDetentionCurfew,
      ])

      const actualResult = await prisonerService.getHdcStatuses(
        [
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            bookingId: '123',
            homeDetentionCurfewEligibilityDate: '26/12/2021',
          } as Prisoner,
        ],
        user
      )

      expect(actualResult).toEqual([
        {
          approvalStatus: 'PASSED',
          bookingId: '123',
          checksPassed: true,
          eligibleForHdc: true,
          homeDetentionCurfewEligibilityDate: '26/12/2021',
        },
      ])
      expect(prisonApiClient.getLatestHdcStatusBatch).toBeCalledWith([123], user)
    })
  })

  it('Search prisoners by prison', async () => {
    const expectedResult = [{ firstName: 'Joe', lastName: 'Bloggs' }]

    prisonerSearchApiClient.searchPrisonersByPrison.mockResolvedValue({
      content: [{ firstName: 'Joe', lastName: 'Bloggs' }],
    } as PagePrisoner)

    const actualResult = await prisonerService.searchPrisonersByPrison('MDI', user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonerSearchApiClient.searchPrisonersByPrison).toHaveBeenCalledWith('MDI', user)
  })
})
