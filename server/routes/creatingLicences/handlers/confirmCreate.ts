import { Request, Response } from 'express'
import moment from 'moment'
import CommunityService from '../../../services/communityService'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase } from '../../../utils/utils'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly communityService: CommunityService,
    private readonly prisonerService: PrisonerService,
    private readonly licenceService: LicenceService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals

    const [nomisRecord, deliusRecord] = await Promise.all([
      this.prisonerService.getPrisonerDetail(nomisId, user),
      this.communityService.getProbationer({ nomsNumber: nomisId }),
    ])

    return res.render('pages/create/confirmCreate', {
      licence: {
        crn: deliusRecord?.otherIds?.crn,
        conditionalReleaseDate: moment(nomisRecord.sentenceDetail.conditionalReleaseDate).format('DD/MM/YYYY'),
        dateOfBirth: moment(nomisRecord.dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(nomisRecord.firstName),
        surname: convertToTitleCase(nomisRecord.lastName),
      },
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const { answer } = req.body

    if (answer === YesOrNo.YES) {
      const { licenceId } = await this.licenceService.createLicence(nomisId, user)
      return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
    }
    return res.redirect(`/licence/create/caseload`)
  }
}
