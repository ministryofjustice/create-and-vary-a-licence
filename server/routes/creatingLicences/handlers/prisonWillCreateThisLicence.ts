import { Request, Response } from 'express'
import moment from 'moment'
import { convertToTitleCase } from '../../../utils/utils'
import PrisonerService from '../../../services/prisonerService'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'

export default class PrisonWillCreateThisLicenceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals

    const [nomisRecord, deliusRecord] = await Promise.all([
      this.prisonerService.getPrisonerDetail(nomisId, user),
      this.communityService.getProbationer({ nomsNumber: nomisId }),
    ])

    const backLink = req.session.returnToCase || '/licence/create/caseload'
    const { email } = await this.licenceService.getOmuEmail(nomisRecord.agencyId, user)

    return res.render('pages/create/prisonWillCreateThisLicence', {
      licence: {
        crn: deliusRecord?.otherIds?.crn,
        actualReleaseDate: nomisRecord.sentenceDetail.confirmedReleaseDate
          ? moment(nomisRecord.sentenceDetail.confirmedReleaseDate).format('DD/MM/YYYY')
          : undefined,
        conditionalReleaseDate: moment(nomisRecord.sentenceDetail.conditionalReleaseDate).format('DD/MM/YYYY'),
        dateOfBirth: moment(nomisRecord.dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(nomisRecord.firstName),
        surname: convertToTitleCase(nomisRecord.lastName),
      },
      omuEmail: email,
      backLink,
    })
  }
}
