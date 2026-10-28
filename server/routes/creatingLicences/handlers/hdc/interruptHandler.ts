import { Request, RequestHandler, Response } from 'express'
import config from '../../../../config'
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

  GET: RequestHandler = async (req, res, next): Promise<void> => {
    const licence = res.locals.licence as Licence

    if (!config.hdc.hdcCreationEnabled) {
      next()
      return
    }

    if (isHdcAddressChecksIncompleteLicence(licence)) {
      this.render(req, res, HdcInterruptType.ADDRESS_CHECKS_INCOMPLETE)
      return
    }

    if (req.query?.continueAfterHdcInterrupt === 'true') {
      next()
      return
    }

    if (isHdcRefusedLicence(licence)) {
      this.render(req, res, HdcInterruptType.REFUSED)
      return
    }

    if (isHdcOptOutLicence(licence)) {
      this.render(req, res, HdcInterruptType.OPT_OUT)
      return
    }

    if (isHdcPostponedLicence(licence)) {
      await this.renderPostponed(req, res, licence, res.locals.user)
      return
    }

    next()
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
}
