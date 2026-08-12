import { Request } from 'express'
import UserType from '../../../enumeration/userType'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import config from '../../../config'

const flashInitialApptUpdatedMessage = (
  req: Request,
  licence: Licence,
  userType: UserType,
  updateFromNoAppointmentNeeded: boolean = false,
) => {
  if (licence.statusCode !== LicenceStatus.SUBMITTED && licence.statusCode !== LicenceStatus.APPROVED) {
    return
  }

  if (config.finalThirdEnabled && updateFromNoAppointmentNeeded && userType === UserType.PRISON) {
    const pathMap: Record<string, string> = {
      TIME_SERVED: '/licence/time-served/edit/id/',
      HARD_STOP: '/licence/hard-stop/edit/id/',
    }

    const routePath = (pathMap[licence.kind] || '/licence/edit/id/') + licence.id
    const updateMessage = `Details updated. You must say <a href=${routePath}/initial-meeting-time>when the initial appointment is for</a> before you can print the licence`
    req.flash('initialAppointmentUpdatedFromNotRequired', updateMessage)
    return
  }

  let updateMessage = 'Details updated.'
  if (userType === UserType.PRISON) {
    updateMessage += ' You must now tell the community probation team.'
    if (licence.statusCode === LicenceStatus.APPROVED) {
      updateMessage += ` <a target="_blank" href='/licence/view/id/${licence.id}/pdf-print'>View and print new licence PDF</a>`
    }
  } else if (userType === UserType.PROBATION && licence.statusCode === LicenceStatus.APPROVED) {
    updateMessage += ' You must now notify the prison so they can print the licence again.'
  }
  req.flash('initialApptUpdated', updateMessage)
}

export default flashInitialApptUpdatedMessage
