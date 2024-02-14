import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'

export default class InitialMeetingNameRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const appointmentPersonType = {
      DUTY_OFFICER: 'Duty Officer',
      RESPONSIBLE_COM: `${licence.responsibleComFullName}, this person’s probation practitioner`,
      SPECIFIC_PERSON: 'Someone else',
    }

    res.render('pages/create/hardStop/initialMeetingPerson', { appointmentPersonType })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)
  }
}
