import { Request, Response } from 'express'
import moment from 'moment'
import ProbationService from '../../../../services/probationService'
import { convertToTitleCase } from '../../../../utils/utils'
import LicenceService from '../../../../services/licenceService'
import LicenceKind from '../../../../enumeration/LicenceKind'
import config from '../../../../config'
import logger from '../../../../../logger'
import PrisonerService from '../../../../services/prisonerService'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly probationService: ProbationService,
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/create/caseload'

    if (config.hdcLicenceCreationBlockEnabled) {
      logger.error('Access denied to HDC licence creation GET due HDC licence not to be created in CVL')
      return res.redirect('/access-denied')
    }

    const [nomisRecord, deliusRecord] = await Promise.all([
      this.licenceService.getPrisonerDetail(nomisId, user),
      this.probationService.getProbationer(nomisId),
    ])

    if (nomisRecord.cvl.isInHardStopPeriod) {
      logger.error('Access denied to HDC licence creation GET due to being in hard stop period')
      return res.redirect('/access-denied')
    }

    if (!nomisRecord.prisoner.homeDetentionCurfewActualDate) {
      logger.error('Access denied to HDC licence creation GET due to not having a HDCAD')
      return res.redirect('/access-denied')
    }

    if (!nomisRecord.prisoner.homeDetentionCurfewEligibilityDate) {
      logger.error('Access denied to HDC licence creation GET due to not having a HDCED')
      return res.redirect('/access-denied')
    }

    const isHdcApproved = await this.prisonerService.isHdcApproved(parseInt(nomisRecord.prisoner.bookingId, 10))

    if (!isHdcApproved) {
      logger.error('Access denied to HDC licence creation GET as not approved for HDC')
      return res.redirect('/access-denied')
    }

    return res.render('pages/create/hdc/confirmCreate', {
      licence: {
        crn: deliusRecord?.crn,
        licenceStartDate: nomisRecord.cvl.licenceStartDate,
        dateOfBirth: moment(nomisRecord.prisoner.dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(nomisRecord.prisoner.firstName),
        surname: convertToTitleCase(nomisRecord.prisoner.lastName),
      },
      backLink,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals

    const nomisRecord = await this.licenceService.getPrisonerDetail(nomisId, user)
    if (nomisRecord.cvl.isInHardStopPeriod) {
      logger.error('Access denied to HDC licence creation POST due to being in hard stop period')
      return res.redirect('/access-denied')
    }

    if (!nomisRecord.prisoner.homeDetentionCurfewActualDate) {
      logger.error('Access denied to HDC licence creation POST due to not having a HDCAD')
      return res.redirect('/access-denied')
    }

    if (!nomisRecord.prisoner.homeDetentionCurfewEligibilityDate) {
      logger.error('Access denied to HDC licence creation POST due to not having a HDCED')
      return res.redirect('/access-denied')
    }

    const isHdcApproved = await this.prisonerService.isHdcApproved(parseInt(nomisRecord.prisoner.bookingId, 10))

    if (!isHdcApproved) {
      logger.error('Access denied to HDC licence creation POST as not approved for HDC')
      return res.redirect('/access-denied')
    }

    const { licenceId } = await this.licenceService.createLicence({ nomsId: nomisId, type: LicenceKind.HDC }, user)
    return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
