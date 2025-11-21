import { Request, Response } from 'express'
import TimeServedService from '../../../../services/timeServedService'
import { type TimeServedProbationConfirmContactRequest } from '../../../../@types/licenceApiClientTypes'
import logger from '../../../../../logger'

export default class ContactProbationTeamRoutes {
  constructor(private readonly timeServedService: TimeServedService) {}

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
    // TODO this may need updating at a later stage but this ticket is not yet written
    return res.redirect(`/licence/hard-stop/id/${licenceId}/confirmation`)
  }
}
