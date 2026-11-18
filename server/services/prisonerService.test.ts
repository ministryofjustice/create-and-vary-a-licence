import { Readable } from 'stream'
import fs from 'fs'
import { User } from '../@types/CvlUserDetails'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import PrisonerService from './prisonerService'
import { PrisonDetail } from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'

jest.mock('fs')
jest.mock('../data/prisonApiClient')
jest.mock('../data/prisonerSearchApiClient')
jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('placeholder image'))

describe('Prisoner Service', () => {
  const prisonApiClient = new PrisonApiClient(null) as jest.Mocked<PrisonApiClient>
  const prisonerSearchApiClient = new PrisonerSearchApiClient(null) as jest.Mocked<PrisonerSearchApiClient>
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

  it('Get Prisons', async () => {
    const expectedResult = [{ agencyId: 'MDI', description: 'Moorland (HMP)' }] as PrisonDetail[]

    prisonApiClient.getPrisons.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.getPrisons()

    expect(actualResult).toEqual(expectedResult)
    expect(prisonApiClient.getPrisons).toHaveBeenCalledWith()
  })

  it('Search Prisoners', async () => {
    const expectedResult = [{ firstName: 'Joe', lastName: 'Bloggs' }] as Prisoner[]

    prisonerSearchApiClient.searchPrisoners.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.searchPrisoners({ lastName: 'Bloggs' } as PrisonerSearchCriteria, user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonerSearchApiClient.searchPrisoners).toHaveBeenCalledWith(
      { lastName: 'Bloggs' } as PrisonerSearchCriteria,
      user,
    )
  })
})
