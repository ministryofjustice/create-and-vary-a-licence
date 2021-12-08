import LicenceApiClient from './licenceApiClient'
import {
  AdditionalConditionsRequest,
  AppointmentAddressRequest,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  BespokeConditionsRequest,
  ContactNumberRequest,
  CreateLicenceRequest,
  Licence,
  LicenceSummary,
  StatusUpdateRequest,
  UpdateAdditionalConditionDataRequest,
} from '../@types/licenceApiClientTypes'
import HmppsRestClient from './hmppsRestClient'
import LicenceStatus from '../enumeration/licenceStatus'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const licenceApiClient = new LicenceApiClient()

describe('Licence API client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')
  const post = jest.spyOn(HmppsRestClient.prototype, 'post')
  const put = jest.spyOn(HmppsRestClient.prototype, 'put')

  beforeEach(() => {
    get.mockResolvedValue(true)
    post.mockResolvedValue(true)
    put.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Create licence request', async () => {
    post.mockResolvedValue({ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary)

    const result = await licenceApiClient.createLicence({} as CreateLicenceRequest, 'joebloggs')

    expect(post).toHaveBeenCalledWith({ path: '/licence/create', data: {} }, 'joebloggs')
    expect(result).toEqual({ licenceId: 1, prisonCode: 'MDI' })
  })

  it('Get licence by Id', async () => {
    get.mockResolvedValue({ id: 1, prisonCode: 'MDI' } as Licence)

    const result = await licenceApiClient.getLicenceById('1', 'joebloggs')

    expect(get).toHaveBeenCalledWith({ path: '/licence/id/1' }, 'joebloggs')
    expect(result).toEqual({ id: 1, prisonCode: 'MDI' })
  })

  it('Update appointment person', async () => {
    await licenceApiClient.updateAppointmentPerson(
      '1',
      { appointmentPerson: 'Joe Bloggs' } as AppointmentPersonRequest,
      'joebloggs'
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointmentPerson', data: { appointmentPerson: 'Joe Bloggs' } },
      'joebloggs'
    )
  })

  it('Update appointment time', async () => {
    await licenceApiClient.updateAppointmentTime(
      '1',
      { appointmentTime: '12:30pm' } as AppointmentTimeRequest,
      'joebloggs'
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointmentTime', data: { appointmentTime: '12:30pm' } },
      'joebloggs'
    )
  })

  it('Update appointment address', async () => {
    await licenceApiClient.updateAppointmentAddress(
      '1',
      { appointmentAddress: '123 Fake Street' } as AppointmentAddressRequest,
      'joebloggs'
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/appointment-address', data: { appointmentAddress: '123 Fake Street' } },
      'joebloggs'
    )
  })

  it('Update contact number', async () => {
    await licenceApiClient.updateContactNumber('1', { comTelephone: '0112877368' } as ContactNumberRequest, 'joebloggs')

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/contact-number', data: { comTelephone: '0112877368' } },
      'joebloggs'
    )
  })

  it('Update bespoke conditions', async () => {
    await licenceApiClient.updateBespokeConditions(
      '1',
      { conditions: ['Not to enter any shopping centres'] } as BespokeConditionsRequest,
      'joebloggs'
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/bespoke-conditions', data: { conditions: ['Not to enter any shopping centres'] } },
      'joebloggs'
    )
  })

  it('Update additional conditions', async () => {
    await licenceApiClient.updateAdditionalConditions(
      '1',
      { additionalConditions: [{ code: 'condition1' }] } as AdditionalConditionsRequest,
      'joebloggs'
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/additional-conditions', data: { additionalConditions: [{ code: 'condition1' }] } },
      'joebloggs'
    )
  })

  it('Update additional condition data', async () => {
    await licenceApiClient.updateAdditionalConditionData(
      '1',
      '2',
      { data: [{ value: 'condition1' }] } as UpdateAdditionalConditionDataRequest,
      'joebloggs'
    )

    expect(put).toHaveBeenCalledWith(
      { path: '/licence/id/1/additional-conditions/condition/2', data: { data: [{ value: 'condition1' }] } },
      'joebloggs'
    )
  })

  it('Update licence status', async () => {
    await licenceApiClient.updateLicenceStatus('1', { status: 'IN_PROGRESS' } as StatusUpdateRequest, 'joebloggs')

    expect(put).toHaveBeenCalledWith({ path: '/licence/id/1/status', data: { status: 'IN_PROGRESS' } }, 'joebloggs')
  })

  it('Get licences by staff id and status', async () => {
    get.mockResolvedValue([{ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary])

    const result = await licenceApiClient.getLicencesByStaffIdAndStatus(1, [LicenceStatus.IN_PROGRESS], 'joebloggs')

    expect(get).toHaveBeenCalledWith(
      { path: '/licence/staffId/1', query: { status: [LicenceStatus.IN_PROGRESS] } },
      'joebloggs'
    )
    expect(result).toEqual([{ licenceId: 1, prisonCode: 'MDI' }])
  })

  it('Match Licences', async () => {
    get.mockResolvedValue([{ licenceId: 1, prisonCode: 'MDI' } as LicenceSummary])

    const result = await licenceApiClient.matchLicences(
      [LicenceStatus.IN_PROGRESS],
      ['MDI'],
      [1],
      ['ABC1234'],
      'conditionalReleaseDate',
      'DESC',
      'joebloggs'
    )

    expect(get).toHaveBeenCalledWith(
      {
        path: '/licence/match',
        query: {
          prison: ['MDI'],
          status: [LicenceStatus.IN_PROGRESS],
          staffId: [1],
          nomisId: ['ABC1234'],
          sortBy: 'conditionalReleaseDate',
          sortOrder: 'DESC',
        },
      },
      'joebloggs'
    )
    expect(result).toEqual([{ licenceId: 1, prisonCode: 'MDI' }])
  })

  it('Batch activate licences', async () => {
    await licenceApiClient.batchActivateLicences([123, 321])

    expect(post).toHaveBeenCalledWith({ path: '/licence/activate-licences', data: [123, 321] })
  })
})
