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
        cvl: { licenceType },
        prisoner: { prisonId, confirmedReleaseDate, conditionalReleaseDate, dateOfBirth, firstName, lastName },
      },
      deliusRecord,
    ] = await Promise.all([
      this.licenceService.getPrisonerDetail(nomisId, user),
      this.probationService.getProbationer({ nomsNumber: nomisId }),
    ])

    const backLink = req.session.returnToCase || '/licence/create/caseload'
    const { email } = await this.licenceService.getOmuEmail(prisonId, user)

    return res.render('pages/create/prisonWillCreateThisLicence', {
      licence: {
        crn: deliusRecord?.otherIds?.crn,
        actualReleaseDate: confirmedReleaseDate ? moment(confirmedReleaseDate).format('DD/MM/YYYY') : undefined,
        conditionalReleaseDate: moment(conditionalReleaseDate).format('DD/MM/YYYY'),
        dateOfBirth: moment(dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(firstName),
        surname: convertToTitleCase(lastName),
      },
      omuEmail: email,
      backLink,
      licenceType,
    })
  }
}
