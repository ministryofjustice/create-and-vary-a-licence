import { Request, RequestHandler, Response } from 'express'
import config from '../../../../config'
import logger from '../../../../../logger'
import { HdcLicence, Licence } from '../../../../@types/licenceApiClientTypes'
import { User } from '../../../../@types/CvlUserDetails'
import {
  isHdcOptOutLicence,
  isHdcPostponedLicence,
  isHdcRefusedLicence,
  isHdcAddressChecksIncompleteLicence,
} from '../../../../utils/utils'
import LicenceService from '../../../../services/licenceService'

const HdcInterruptType = {
  ADDRESS_CHECKS_INCOMPLETE: 'addressChecksIncomplete',
  REFUSED: 'refused',
  OPT_OUT: 'optOut',
  POSTPONED: 'postponed',
} as const

type HdcInterruptType = (typeof HdcInterruptType)[keyof typeof HdcInterruptType]

export default class InterruptHandler {
  constructor(private readonly licenceService: LicenceService) {}

  redirectIfRequired: RequestHandler = (req, res, next): void => {
    const licence = res.locals.licence as Licence

    if (!config.hdc.hdcCreationEnabled) {
      next()
      return
    }

    const interruptType = this.getInterruptType(licence)
    const isAddressChecksIncomplete = interruptType === HdcInterruptType.ADDRESS_CHECKS_INCOMPLETE
    const canContinueAfterInterrupt = req.query?.continueAfterHdcInterrupt === 'true'

    if (interruptType && (isAddressChecksIncomplete || !canContinueAfterInterrupt)) {
      res.redirect(`/licence/create/id/${req.params.licenceId}/interrupt`)
      return
    }

    next()
  }

  GET: RequestHandler = async (req, res): Promise<void> => {
    const licence = res.locals.licence as Licence

    const interruptType = this.getInterruptType(licence)

    if (!interruptType) {
      res.redirect(`/licence/create/id/${req.params.licenceId}/check-your-answers`)
      return
    }

    logger.info(`HDC interrupt displayed for licence ${licence.id ?? req.params.licenceId}; reason: ${interruptType}`)

    if (interruptType === HdcInterruptType.POSTPONED) {
      await this.renderPostponed(req, res, licence as HdcLicence, res.locals.user)
      return
    }

    this.render(req, res, interruptType)
  }

  private render = (req: Request, res: Response, interruptType: HdcInterruptType, omuContact?: string): void => {
    const { licenceId } = req.params
    const backLink = req.session?.returnToCase || '/licence/create/caseload'
    const isAddressChecksIncomplete = interruptType === HdcInterruptType.ADDRESS_CHECKS_INCOMPLETE

    res.render('pages/create/hdc/interrupt', {
      backLink,
      toCheckYourAnswer: `/licence/create/id/${licenceId}/check-your-answers${
        isAddressChecksIncomplete ? '' : '?continueAfterHdcInterrupt=true'
      }`,
      interruptType,
      ...(isAddressChecksIncomplete && { hdcAddressChecksComplete: false }),
      ...(omuContact && { omuContact }),
    })
  }

  private renderPostponed = async (req: Request, res: Response, licence: HdcLicence, user: User): Promise<void> => {
    const omuEmail = (await this.licenceService.getOmuEmail(licence.prisonCode, user))?.email
    this.render(req, res, HdcInterruptType.POSTPONED, omuEmail ?? licence.prisonCode)
  }

  private getInterruptType = (licence: Licence): HdcInterruptType | undefined => {
    if (isHdcAddressChecksIncompleteLicence(licence)) {
      return HdcInterruptType.ADDRESS_CHECKS_INCOMPLETE
    }
    if (isHdcRefusedLicence(licence)) {
      return HdcInterruptType.REFUSED
    }
    if (isHdcOptOutLicence(licence)) {
      return HdcInterruptType.OPT_OUT
    }
    if (isHdcPostponedLicence(licence)) {
      return HdcInterruptType.POSTPONED
    }
    return undefined
  }
}
