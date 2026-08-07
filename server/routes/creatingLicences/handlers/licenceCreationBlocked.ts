import { Request, Response } from 'express'
import moment from 'moment'
import LicenceService from '../../../services/licenceService'
import { convertToTitleCase } from '../../../utils/utils'

export default class LicenceCreationBlockedRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals

    const [
      {
        cvl: { licenceType, licenceStartDate, isTimeServed },
        prisoner: { dateOfBirth, firstName, lastName },
      },
      deliusRecord,
    ] = await Promise.all([
      this.licenceService.getPrisonerDetail(nomisId, user),
      this.licenceService.getProbationCase(nomisId, user),
    ])

    const backLink = req.session.returnToCase || '/licence/create/caseload'

    return res.render('pages/create/licenceCreationBlocked', {
      licence: {
        crn: deliusRecord?.crn,
        licenceStartDate,
        dateOfBirth: moment(dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(firstName),
        surname: convertToTitleCase(lastName),
        isTimeServed,
      },
      backLink,
      licenceType,
    })
  }
}
