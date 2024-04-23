import { Request, Response } from 'express'
import moment from 'moment'
import CommunityService from '../../../services/communityService'
import { convertToTitleCase } from '../../../utils/utils'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import UkBankHolidayFeedService from '../../../services/ukBankHolidayFeedService'
import LicenceKind from '../../../enumeration/LicenceKind'
import logger from '../../../../logger'
import config from '../../../config'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService,
    private readonly ukBankHolidayFeedService: UkBankHolidayFeedService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/create/caseload'

    const [nomisRecord, deliusRecord, bankHolidays] = await Promise.all([
      this.licenceService.getPrisonerDetail(nomisId, user),
      this.communityService.getProbationer({ nomsNumber: nomisId }),
      this.ukBankHolidayFeedService.getEnglishAndWelshHolidays(),
    ])

    if (config.hardStopEnabled && nomisRecord.cvl.isInHardStopPeriod) {
      logger.error('Access denied to PP licence creation GET due to being in hard stop period')
      return res.redirect('/access-denied')
    }

    return res.render('pages/create/confirmCreate', {
      licence: {
        crn: deliusRecord?.otherIds?.crn,
        actualReleaseDate: nomisRecord.prisoner.confirmedReleaseDate
          ? moment(nomisRecord.prisoner.confirmedReleaseDate).format('DD/MM/YYYY')
          : undefined,
        conditionalReleaseDate: moment(nomisRecord.prisoner.conditionalReleaseDate).format('DD/MM/YYYY'),
        dateOfBirth: moment(nomisRecord.prisoner.dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(nomisRecord.prisoner.firstName),
        surname: convertToTitleCase(nomisRecord.prisoner.lastName),
      },
      releaseIsOnBankHolidayOrWeekend: bankHolidays.isBankHolidayOrWeekend(
        moment(nomisRecord.prisoner.confirmedReleaseDate || nomisRecord.prisoner.conditionalReleaseDate)
      ),
      backLink,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const { answer } = req.body
    const backLink = req.session?.returnToCase

    const nomisRecord = await this.licenceService.getPrisonerDetail(nomisId, user)
    if (config.hardStopEnabled && nomisRecord.cvl.isInHardStopPeriod) {
      logger.error('Access denied to PP licence creation POST due to being in hard stop period')
      return res.redirect('/access-denied')
    }

    if (answer === YesOrNo.YES) {
      const { licenceId } = await this.licenceService.createLicence({ nomsId: nomisId, type: LicenceKind.CRD }, user)
      return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
    }
    return res.redirect(backLink)
  }
}
