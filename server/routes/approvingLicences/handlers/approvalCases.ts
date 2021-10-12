import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'

export default class ApprovalCaseRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user

    // Get prison caseload list - either here or in the service layer
    const prisonCaseload = ['MDI', 'LEI']

    // Get prison caseload list - the proper way
    // const prisonCaseload = await this prisonerService.getPrisonCaseload()

    const cases = await this.licenceService.getLicencesForApproval(username, prisonCaseload)

    const caseViewModel = cases.map(licence => {
      return {
        licenceId: licence.licenceId,
        licenceType: licence.licenceType,
        surname: licence.surname,
        forename: licence.forename,
        nomisId: licence.nomisId,
        status: licence.licenceStatus,
        prisonDescription: licence.prisonDescription,
        conditionalReleaseDate: licence.conditionalReleaseDate,
      }
    })
    res.render('pages/approve/cases', { cases: caseViewModel })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.body
    res.redirect(`/licence/approve/id/${licenceId}/view`)
  }
}
