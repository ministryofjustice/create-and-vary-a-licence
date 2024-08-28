import { Request } from 'express'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'
import UserType from '../../../enumeration/userType'

describe('Initial appointment updated flash message', () => {
  let req: Request
  let licence: Licence
  beforeEach(() => {
    req = {
      flash: jest.fn(),
    } as unknown as Request
    licence = {
      id: 1,
      statusCode: LicenceStatus.APPROVED,
    } as Licence
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const messageKey = 'initialApptUpdated'

  it('does not generate a message for any licence statuses other than SUBMITTED or APPROVED', () => {
    Object.values(LicenceStatus).forEach(statusCode => {
      flashInitialApptUpdatedMessage(
        req,
        { ...licence, statusCode: statusCode as Licence['statusCode'] },
        UserType.PROBATION
      )
    })

    expect(req.flash).toHaveBeenCalledTimes(2)
  })

  describe('for prison users', () => {
    const userType = UserType.PRISON
    it('sends the expected message for SUBMITTED licences', () => {
      licence.statusCode = LicenceStatus.SUBMITTED
      const expectedMessage = 'Initial appointment details updated. You must now tell the community probation team.'
      flashInitialApptUpdatedMessage(req, licence, userType)

      expect(req.flash).toHaveBeenCalledWith(messageKey, expectedMessage)
    })

    it('sends the expected message for APPROVED licences', () => {
      const expectedMessage = `Initial appointment details updated. You must now tell the community probation team. <a target="_blank" href='/licence/view/id/1/pdf-print'>View and print new licence PDF</a>`
      flashInitialApptUpdatedMessage(req, licence, userType)

      expect(req.flash).toHaveBeenCalledWith(messageKey, expectedMessage)
    })
  })

  describe('for probation users', () => {
    const userType = UserType.PROBATION
    it('sends the expected message for SUBMITTED licences', () => {
      licence.statusCode = LicenceStatus.SUBMITTED
      const expectedMessage = 'Initial appointment details updated.'
      flashInitialApptUpdatedMessage(req, licence, userType)

      expect(req.flash).toHaveBeenCalledWith(messageKey, expectedMessage)
    })

    it('sends the expected message for APPROVED licences', () => {
      const expectedMessage =
        'Initial appointment details updated. You must now notify the prison so they can print the licence again.'
      flashInitialApptUpdatedMessage(req, licence, userType)

      expect(req.flash).toHaveBeenCalledWith(messageKey, expectedMessage)
    })
  })
})
