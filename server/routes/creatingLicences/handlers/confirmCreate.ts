import { Request, Response } from 'express'
import moment from 'moment'
import CommunityService from '../../../services/communityService'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase, isBankHolidayOrWeekend } from '../../../utils/utils'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly communityService: CommunityService,
    private readonly prisonerService: PrisonerService,
    private readonly licenceService: LicenceService,
    private readonly ukBankHolidayFeedService: UkBankHolidayFeedService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session.returnToCase || '/licence/create/caseload'

    const [nomisRecord, deliusRecord, bankHolidays] = await Promise.all([
      this.prisonerService.getPrisonerDetail(nomisId, user),
      this.communityService.getProbationer({ nomsNumber: nomisId }),
      this.ukBankHolidayFeedService.getEnglishAndWelshHolidays(),
    ])

    return res.render('pages/create/confirmCreate', {
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
      releaseIsOnBankHolidayOrWeekend: isBankHolidayOrWeekend(
        moment(nomisRecord.sentenceDetail.confirmedReleaseDate || nomisRecord.sentenceDetail.conditionalReleaseDate),
        bankHolidays
      ),
      backLink,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const { answer } = req.body
    const backLink = req.session.returnToCase

    if (answer === YesOrNo.YES) {
      const { licenceId } = await this.licenceService.createLicence(nomisId, user)
      return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
    }
    return res.redirect(backLink)
  }
}
