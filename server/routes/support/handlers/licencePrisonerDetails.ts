import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceOverrideService from '../../../services/licenceOverrideService'
import { OverrideLicencePrisonerDetailsRequest } from '../../../@types/licenceApiClientTypes'

export default class LicencePrisonerDetailsRoutes {
  constructor(
    private licenceService: LicenceService,
    private licenceOverrideService: LicenceOverrideService,
  ) {}

  private async getLicenceAndDob(licenceId: string, user: Express.LocalsUser) {
    const licence = await this.licenceService.getLicence(parseInt(licenceId, 10), user)
    const [day, month, year] = licence.dateOfBirth.split('/')
    return { licence, dateOfBirth: { day, month, year } }
  }

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId } = req.params

    res.render('pages/support/licencePrisonerDetails', {
      ...(await this.getLicenceAndDob(licenceId, user)),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId } = req.params
    const { dateOfBirth, ...restOfBody } = req.body

    const details: OverrideLicencePrisonerDetailsRequest = {
      ...restOfBody,
      dateOfBirth: `${dateOfBirth.day}/${dateOfBirth.month}/${dateOfBirth.year}`,
    }

    await this.licenceOverrideService.overrideLicencePrisonerDetails(parseInt(licenceId, 10), details, user)

    res.render('pages/support/licencePrisonerDetails', {
      ...(await this.getLicenceAndDob(licenceId, user)),
    })
  }
}
