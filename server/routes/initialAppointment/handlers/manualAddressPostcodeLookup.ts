import { Request, Response } from 'express'
import UserType from '../../../enumeration/userType'
import { AddAddressRequest } from '../../../@types/licenceApiClientTypes'
import AddressService from '../../../services/addressService'

export default class ManualAddressPostcodeLookupRoutes {
  constructor(
    private readonly addressService: AddressService,
    private readonly userType: UserType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const isPrisonUser = this.userType === UserType.PRISON
    const basePath = `/licence/${isPrisonUser ? 'view' : 'create'}/id/${licenceId}`
    const fromReview = req.query?.fromReview
    const fromReviewParam = fromReview ? '?fromReview=true' : ''
    res.render('pages/initialAppointment/manualAddressPostcodeLookupForm', {
      postcodeLookupUrl: `${basePath}/initial-meeting-place${fromReviewParam}`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    const basePath = `/licence/create/id/${licenceId}`
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

    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`${basePath}/check-your-answers`)
    } else {
      res.redirect(`${basePath}/initial-meeting-contact`)
    }
  }
}
