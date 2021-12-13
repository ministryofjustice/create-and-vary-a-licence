import { User } from '../@types/CvlUserDetails'
import PrisonRegisterService from './prisonRegisterService'
import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'

jest.mock('../data/prisonRegisterApiClient')

describe('Prisoner Service', () => {
  const prisonRegisterApiClient = new PrisonRegisterApiClient() as jest.Mocked<PrisonRegisterApiClient>
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

  it('Get OMU contact email', async () => {
    prisonRegisterApiClient.getPrisonOmuContactEmail.mockResolvedValue('omu@prison.gov.uk')

    const actualResult = await prisonRegisterService.getPrisonOmuContactEmail('MDI', user)

    expect(actualResult).toEqual('omu@prison.gov.uk')
    expect(prisonRegisterApiClient.getPrisonOmuContactEmail).toBeCalledWith('MDI', user)
  })
})
