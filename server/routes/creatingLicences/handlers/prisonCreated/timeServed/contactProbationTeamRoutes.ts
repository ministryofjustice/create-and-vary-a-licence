import { Request, Response } from 'express'
import TimeServedService from '../../../../../services/timeServedService'
import { type TimeServedProbationConfirmContactRequest } from '../../../../../@types/licenceApiClientTypes'
import logger from '../../../../../../logger'
import PathType from '../../../../../enumeration/pathType'

export const getTimeServerContactProbation = (licenceId: string) => {
  return `/licence/time-served/create/id/${licenceId}/contact-probation-team`
}

export default class ContactProbationTeamRoutes {
  constructor(
    private readonly timeServedService: TimeServedService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const backLink = req.session?.returnToCase || '/licence/view/cases'

    return res.render('pages/create/prisonCreated/timeServed/confirmContactProbationTeam', {
      licence,
      backLink,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    logger.info('ContactProbationTeamRoutes POST started')
    const { licenceId } = req.params
    const { user } = res.locals
    const { contactStatus, communicationMethods } = req.body

    await this.timeServedService.addTimeServedProbationConfirmContact(
      Number(licenceId),
      {
        contactStatus,
        communicationMethods,
        otherCommunicationDetail: communicationMethods?.includes('OTHER')
          ? req.body.otherCommunicationDetail
          : undefined,
      } as TimeServedProbationConfirmContactRequest,
      user,
    )

    logger.info('ContactProbationTeamRoutes POST completed')
    res.redirect(this.getRedirectPath(licenceId))
  }

  private getRedirectPath(licenceId: string): string {
    if (PathType.EDIT === this.path) {
      return `/licence/time-served/id/${licenceId}/check-your-answers`
    }
    return `/licence/time-served/id/${licenceId}/confirmation`
  }
}
