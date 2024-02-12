import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'

export default class InitialMeetingNameRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const appointmentWithType = {
      DUTY_OFFICER: 'Duty Officer',
      RESPONSIBLE_COM: `${licence.responsibleComFullName}, this person’s probation practitioner`,
      SOMEONE_ELSE: 'Someone else',
    }

    res.render('pages/create/hardStop/initialMeetingPerson', {
      releaseIsOnBankHolidayOrWeekend: licence.isEligibleForEarlyRelease,
      appointmentWithType,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)
  }
}
