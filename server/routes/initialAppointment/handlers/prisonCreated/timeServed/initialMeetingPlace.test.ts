import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../../../services/licenceService'
import Address from '../../../types/address'
import PathType from '../../../../../enumeration/pathType'
import config from '../../../../../config'
import AddressService from '../../../../../services/addressService'

jest.mock('../../initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const addressService = new AddressService(null) as jest.Mocked<AddressService>

describe('Route Handlers - Create Licence - Initial Meeting Place', () => {
  let req: Request
  let res: Response
  let formAddress: Address

  beforeEach(() => {
    formAddress = {
      addressLine1: 'Manchester Probation Service',
      addressLine2: 'Unit 4',
      addressTown: 'Smith Street',
      addressCounty: 'Stockport',
      addressPostcode: 'SP1 3DN',
    } as unknown as Address

    req = {
      params: {
        licenceId: 1,
      },
      body: formAddress,
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          appointmentAddress: 'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN',
          conditionalReleaseDate: '14/05/2022',
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response
    config.postcodeLookupEnabled = false

    licenceService.updateAppointmentAddress = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
    addressService.getPreferredAddresses = jest.fn()
    addressService.addAppointmentAddress = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    config.postcodeLookupEnabled = false
  })

  describe('Time Served licence prison user journey', () => {
    const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
          preferredAddresses: [],
          formAddress,
          continueOrSaveLabel: 'Continue',
          manualAddressEntryUrl: '/licence/view/cases',
        })
      })
    })
  })
})
