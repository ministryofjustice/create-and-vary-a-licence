import { Request, Response } from 'express'
import moment from 'moment/moment'
import LicenceService from '../../../../../services/licenceService'
import { convertToTitleCase } from '../../../../../utils/utils'

export default class NoComAllocated {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const {
      prisoner: { firstName, lastName, dateOfBirth },
      cvl: { licenceStartDate },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    return res.render('pages/create/prisonCreated/hardStop/noComAllocated', {
      nomisId,
      name: convertToTitleCase(`${firstName} ${lastName}`),
      licenceStartDate,
      dateOfBirth: moment(dateOfBirth).format('DD/MM/YYYY'),
      backLink: '/licence/view/cases',
    })
  }
}
