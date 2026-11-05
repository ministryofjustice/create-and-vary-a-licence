import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../__testutils/appSetup'
import LicenceService from '../../services/licenceService'
import AuditService from '../../services/audit/auditService'
import { Licence } from '../../@types/licenceApiClientTypes'
import { User } from '../../@types/CvlUserDetails'
import LicenceKind from '../../enumeration/LicenceKind'
import LicenceStatus from '../../enumeration/licenceStatus'
import AuthRole from '../../enumeration/authRole'
import config from '../../config'

jest.mock('../../services/licenceService')
jest.mock('../../services/audit/auditService')

describe('HDC interrupt route access', () => {
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const auditService = new AuditService(null) as jest.Mocked<AuditService>
  const originalHdcCreationEnabled = config.hdc.hdcCreationEnabled
  let app: Express
  let licence: Licence
  let user: User

  beforeEach(() => {
    config.hdc.hdcCreationEnabled = true
    licence = {
      id: 1,
      nomsId: 'A1234BC',
      kind: LicenceKind.HDC,
      statusCode: LicenceStatus.IN_PROGRESS,
      probationTeamCode: 'ABC123',
      isReplacementForOptedInLicence: true,
      hdcRiskChecksComplete: false,
    } as Licence
    user = {
      username: 'joebloggs',
      isProbationUser: true,
      deliusStaffIdentifier: 2000,
      probationTeamCodes: ['ABC123'],
      userRoles: [AuthRole.RESPONSIBLE_OFFICER],
    } as User
    licenceService.getLicence.mockResolvedValue(licence)
    licenceService.checkComCaseAccess.mockResolvedValue({ crn: 'X12345', type: 'NONE' })
    app = appWithAllRoutes({ services: { licenceService, auditService }, userSupplier: () => user })
  })

  afterEach(() => {
    config.hdc.hdcCreationEnabled = originalHdcCreationEnabled
    jest.resetAllMocks()
  })

  it('renders the interrupt without redirecting to itself', async () => {
    const response = await request(app).get('/licence/hdc/create/id/1/interrupt').expect(200)
    expect(response.text).toContain(
      'You must complete the address checks in HDC before you can continue with this licence in CVL.',
    )
  })

  it.each([
    '/licence/create/id/1/check-your-answers',
    '/licence/create/id/1/edit',
    '/licence/create/id/1/initial-meeting-name',
    '/licence/create/id/1/additional-licence-conditions',
  ])('denies a COM directly visiting %s', async path => {
    await request(app).get(path).expect(302).expect('Location', '/access-denied')
  })

  it.each([
    '/licence/create/id/1/check-your-answers',
    '/licence/create/id/1/edit',
    '/licence/create/id/1/initial-meeting-name',
    '/licence/create/id/1/additional-licence-conditions',
  ])('blocks updates to %s before the handler runs', async path => {
    await request(app).post(path).send({}).expect(302).expect('Location', '/access-denied')
  })

  it.each([
    '/licence/approve/id/1/view',
    '/licence/vary-approve/id/1/view',
    '/licence/vary/id/1/confirm-vary-action',
    '/licence/vary/id/1/hdc/address-checks',
  ])('denies access to %s through existing status checks', async path => {
    user.userRoles = [AuthRole.RESPONSIBLE_OFFICER, AuthRole.DECISION_MAKER, AuthRole.ASSISTANT_CHIEF]

    await request(app).get(path).expect(302).expect('Location', '/access-denied')
    await request(app).post(path).send({}).expect(302).expect('Location', '/access-denied')
  })

  it.each(['/licence/create/id/1/check-your-answers', '/licence/hdc/create/id/1/interrupt'])(
    'enforces team access before the HDC journey for %s',
    async path => {
      user.probationTeamCodes = ['OTHER']
      await request(app).get(path).expect(302).expect('Location', '/access-denied')
      expect(licenceService.canComAccessLicence).toHaveBeenCalledTimes(1)
    },
  )

  it.each(['/licence/create/id/1/check-your-answers', '/licence/hdc/create/id/1/interrupt'])(
    'enforces case restrictions for %s',
    async path => {
      licenceService.checkComCaseAccess.mockResolvedValue({ crn: 'X12345', type: 'RESTRICTED' })
      await request(app).get(path).expect(302).expect('Location', '/X12345/restricted')
    },
  )

  it('enforces role access on the interrupt', async () => {
    user.userRoles = [AuthRole.READONLY]
    await request(app).get('/licence/hdc/create/id/1/interrupt').expect(302).expect('Location', '/access-denied')
  })

  it('enforces status access on the interrupt', async () => {
    licence.statusCode = LicenceStatus.SUBMITTED
    await request(app).get('/licence/hdc/create/id/1/interrupt').expect(302).expect('Location', '/access-denied')
  })

  it('allows the interrupt when the feature is disabled to redirect back to the journey', async () => {
    config.hdc.hdcCreationEnabled = false
    await request(app)
      .get('/licence/hdc/create/id/1/interrupt')
      .expect(302)
      .expect('Location', '/licence/create/id/1/check-your-answers')
  })
})
