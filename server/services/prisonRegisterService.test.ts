import { User } from '../@types/CvlUserDetails'
import PrisonRegisterService from './prisonRegisterService'
import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'

jest.mock('../data/prisonRegisterApiClient')

describe('Prison Register Service', () => {
  const prisonRegisterApiClient = new PrisonRegisterApiClient(null) as jest.Mocked<PrisonRegisterApiClient>
  const prisonRegisterService = new PrisonRegisterService(prisonRegisterApiClient)

  const user = { username: 'joebloggs' } as User

  it('Get Prison Description', async () => {
    const expectedResult = {
      prisonName: 'Moorland (HMP)',
    } as PrisonDto
    prisonRegisterApiClient.getPrisonDescription.mockResolvedValue(expectedResult)

    const actualResult = await prisonRegisterService.getPrisonDescription('MDI', user)

    expect(actualResult).toEqual(actualResult)
    expect(prisonRegisterApiClient.getPrisonDescription).toBeCalledWith('MDI', user)
  })
})
