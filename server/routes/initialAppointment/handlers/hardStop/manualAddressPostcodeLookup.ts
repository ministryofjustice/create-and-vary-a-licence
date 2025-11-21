import { Request, Response } from 'express'
import { AddAddressRequest } from '../../../../@types/licenceApiClientTypes'
import AddressService from '../../../../services/addressService'
import PathType from '../../../../enumeration/pathType'

export default class ManualAddressPostcodeLookupRoutes {
  constructor(
    private readonly addressService: AddressService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const action = this.path === PathType.EDIT ? 'edit' : 'create'
    const basePath = `/licence/hard-stop/${action}/id/${licenceId}`
    res.render('pages/initialAppointment/prisonCreated/manualAddressPostcodeLookupForm', {
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
      postcodeLookupUrl: `${basePath}/initial-meeting-place`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    const { isPreferredAddress } = req.body
    const { firstLine, secondLine, townOrCity, county, postcode } = req.body

    const appointmentAddress = {
      firstLine,
      secondLine,
      townOrCity,
      county,
      postcode,
      source: 'MANUAL',
      isPreferredAddress: isPreferredAddress === 'true',
    } as AddAddressRequest

    await this.addressService.addAppointmentAddress(licenceId, appointmentAddress, user)

    if (this.path === PathType.EDIT) {
      res.redirect(`/licence/hard-stop/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-contact`)
    }
  }
}
