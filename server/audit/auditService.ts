import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { User } from '../@types/CvlUserDetails'
import { AuditPolicy } from './routeAuditPolicy'
import applicationInfo from '../applicationInfo'
import { Licence } from '../@types/licenceApiClientTypes'

export default class AuditService {
  async recordAuditEvent(
    requestId: string,
    policy: AuditPolicy,
    licence: Licence | undefined,
    user: User,
  ): Promise<void> {
    const auditData = {
      what: policy.event,
      when: new Date().toISOString(),
      // operationId: 'dozdi57zFcTfTwkr511FRviCRGAOav1b', // Not required and from a search of Github, I can't see anyone else populating this
      subjectId: this.getSubjectIdFromRequest(licence, user),
      subjectType: 'LICENCE', // or OFFENDER, LICENCE, etc
      correlationId: requestId,
      who: user.username,
      service: applicationInfo().applicationName,
      details: {
        build: applicationInfo().gitRef,
        userRoles: user.userRoles,
      },
      user,
    }

    telemetry.setSpanAttributes({ audit_event: policy.event })

    console.log(`audit event: ${policy.event}`)
    console.log(`audit event data: ${JSON.stringify(auditData)}`)
    // TODO: send audit message
  }

  private getSubjectIdFromRequest(licence: Licence | undefined, user: User): string {
    if (licence) {
      if (user?.nomisStaffId) {
        return licence.nomsId
      }

      if (user?.deliusStaffIdentifier) {
        return licence.crn
      }
    }
    return '' // TODO: any other possible subjectId sources?
  }
}
