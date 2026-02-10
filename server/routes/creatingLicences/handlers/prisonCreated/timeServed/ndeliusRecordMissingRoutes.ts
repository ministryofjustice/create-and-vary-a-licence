import { Request, Response } from 'express'
import moment from 'moment/moment'
import LicenceService from '../../../../../services/licenceService'

export default class NDeliusRecordMissingRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const {
      prisoner: { dateOfBirth },
      cvl: { licenceStartDate },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    return res.render('pages/create/prisonCreated/timeServed/ndeliusRecordMissing', {
      nomisId,
      licenceStartDate,
      dateOfBirth: moment(dateOfBirth).format('DD/MM/YYYY'),
      backLink: '/licence/view/cases',
    })
  }
}
