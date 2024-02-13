import { Request } from 'express'
import UserType from '../../../enumeration/userType'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'

const flashInitialApptUpdatedMessage = (req: Request, licence: Licence, userType: UserType) => {
  if (licence.statusCode !== LicenceStatus.SUBMITTED && licence.statusCode !== LicenceStatus.APPROVED) {
    return
  }

  let updateMessage = 'Initial appointment details updated.'
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
