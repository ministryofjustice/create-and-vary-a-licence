import { Request, Response } from 'express'
import moment from 'moment'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import ProbationService from '../../../services/probationService'

export default class PrisonWillCreateThisLicenceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly probationService: ProbationService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals

    const [
      {
        cvl: { licenceType, licenceStartDate, hardStopKind },
        prisoner: { prisonId, dateOfBirth, firstName, lastName },
      },
      deliusRecord,
    ] = await Promise.all([
      this.licenceService.getPrisonerDetail(nomisId, user),
      this.probationService.getProbationer(nomisId),
    ])

    const backLink = req.session.returnToCase || '/licence/create/caseload'
    const omuEmailResponse = await this.licenceService.getOmuEmail(prisonId, user)
    const email = omuEmailResponse?.email || null

    return res.render('pages/create/prisonWillCreateThisLicence', {
      licence: {
        crn: deliusRecord?.crn,
        licenceStartDate,
        dateOfBirth: moment(dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(firstName),
        surname: convertToTitleCase(lastName),
        hardStopKind,
      },
      omuEmail: email,
      backLink,
      licenceType,
    })
  }
}
