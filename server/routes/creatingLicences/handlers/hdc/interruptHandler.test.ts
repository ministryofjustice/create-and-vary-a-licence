import { NextFunction, Request, Response } from 'express'
import InterruptHandler from './interruptHandler'
import LicenceKind from '../../../../enumeration/LicenceKind'
import LicenceStatus from '../../../../enumeration/licenceStatus'
import { Licence } from '../../../../@types/licenceApiClientTypes'
import { User } from '../../../../@types/CvlUserDetails'
import config from '../../../../config'
import LicenceService from '../../../../services/licenceService'

describe('Route Handlers - Create Licence - HDC interrupt', () => {
  const getOmuEmail = jest.fn()
  const handler = new InterruptHandler({ getOmuEmail } as unknown as LicenceService)
  let req: Request
  let res: Response
  let next: NextFunction
  let originalHdcCreationEnabled: boolean

  beforeEach(() => {
    originalHdcCreationEnabled = config.hdc.hdcCreationEnabled
    config.hdc.hdcCreationEnabled = true
    getOmuEmail.mockResolvedValue(null)
    req = {
      path: '/licence/create/id/123/check-your-answers',
      params: { licenceId: '123' },
      session: { returnToCase: '/licence/create/caseload?view=team' },
    } as unknown as Request
    res = { render: jest.fn(), redirect: jest.fn(), locals: {} } as unknown as Response
    next = jest.fn()
  })

  afterEach(() => {
    config.hdc.hdcCreationEnabled = originalHdcCreationEnabled
  })

  it('should render the refused interrupt from the fetched licence state', async () => {
    res.locals.licence = {
      kind: LicenceKind.CRD,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForRefusedLicence: true,
    } as Licence

    await handler.GET(req, res, next)

    expect(res.render).toHaveBeenCalledWith('pages/create/hdc/interrupt', {
      backLink: '/licence/create/caseload?view=team',
      toCheckYourAnswer: '/licence/create/id/123/check-your-answers?continueAfterHdcInterrupt=true',
      interruptType: 'refused',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should redirect to the dedicated interrupt route when an interrupt applies', () => {
    res.locals.licence = {
      kind: LicenceKind.CRD,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForRefusedLicence: true,
    } as Licence

    handler.redirectIfRequired(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/123/interrupt')
    expect(next).not.toHaveBeenCalled()
  })

  it('should continue to check answers after the COM chooses Continue from the refused interrupt', async () => {
    req.query = { continueAfterHdcInterrupt: 'true' }
    res.locals.licence = {
      kind: LicenceKind.CRD,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForRefusedLicence: true,
    } as Licence

    handler.redirectIfRequired(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.render).not.toHaveBeenCalled()
  })

  it('should render the opted-in interrupt when address checks are incomplete', async () => {
    const licence = {
      id: 123,
      kind: LicenceKind.HDC,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForOptedInLicence: true,
      hdcAddressChecksComplete: false,
    } as Licence

    res.locals.licence = licence

    await handler.GET(req, res, next)

    expect(res.render).toHaveBeenCalledWith('pages/create/hdc/interrupt', {
      backLink: '/licence/create/caseload?view=team',
      toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
      interruptType: 'addressChecksIncomplete',
      hdcAddressChecksComplete: false,
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should continue to check answers when address checks are complete', async () => {
    res.locals.licence = {
      kind: LicenceKind.HDC,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForOptedInLicence: true,
      hdcAddressChecksComplete: true,
    } as Licence

    handler.redirectIfRequired(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should render the opt-out interrupt from the fetched licence state', async () => {
    res.locals.licence = {
      kind: LicenceKind.CRD,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForOptedOutLicence: true,
    } as Licence

    await handler.GET(req, res, next)

    expect(res.render).toHaveBeenCalledWith('pages/create/hdc/interrupt', {
      backLink: '/licence/create/caseload?view=team',
      toCheckYourAnswer: '/licence/create/id/123/check-your-answers?continueAfterHdcInterrupt=true',
      interruptType: 'optOut',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should render the postponed interrupt with the OMU email when available', async () => {
    getOmuEmail.mockResolvedValue({ email: 'omu@example.test' })
    res.locals.user = { username: 'joebloggs' } as unknown as User
    res.locals.licence = {
      kind: LicenceKind.HDC,
      statusCode: LicenceStatus.IN_PROGRESS,
      isPostponed: true,
      prisonCode: 'MDI',
    } as Licence

    await handler.GET(req, res, next)

    expect(getOmuEmail).toHaveBeenCalledWith('MDI', res.locals.user)
    expect(res.render).toHaveBeenCalledWith('pages/create/hdc/interrupt', {
      backLink: '/licence/create/caseload?view=team',
      toCheckYourAnswer: '/licence/create/id/123/check-your-answers?continueAfterHdcInterrupt=true',
      interruptType: 'postponed',
      omuContact: 'omu@example.test',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should continue after Continue from opt-out or postponed interrupts', async () => {
    req.query = { continueAfterHdcInterrupt: 'true' }
    res.locals.licence = {
      kind: LicenceKind.CRD,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForOptedOutLicence: true,
    } as Licence

    handler.redirectIfRequired(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.render).not.toHaveBeenCalled()
  })

  it('should keep blocking when address checks are incomplete despite the Continue query', async () => {
    req.query = { continueAfterHdcInterrupt: 'true' }
    res.locals.licence = {
      kind: LicenceKind.HDC,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForOptedInLicence: true,
      hdcAddressChecksComplete: false,
    } as Licence

    handler.redirectIfRequired(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/123/interrupt')
    expect(next).not.toHaveBeenCalled()
  })

  it('should continue when HDC creation is disabled', async () => {
    config.hdc.hdcCreationEnabled = false
    const licence = {
      kind: LicenceKind.HDC,
      statusCode: LicenceStatus.IN_PROGRESS,
      isReplacementForOptedInLicence: true,
      hdcAddressChecksComplete: false,
    } as Licence
    res.locals.licence = licence

    handler.redirectIfRequired(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.render).not.toHaveBeenCalled()
  })
})
