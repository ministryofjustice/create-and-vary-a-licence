import { resetStubs, verifyEndpointCalled } from '../wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import licence from '../mockApis/licence'
import community from '../mockApis/community'
import prisonerSearch from '../mockApis/prisonerSearch'
import prison from '../mockApis/prison'
import probationSearch from '../mockApis/probationSearch'
import events from '../support/events'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,
    verifyEndpointCalled,

    getSignInUrl: auth.getSignInUrl,
    stubPrisonSignIn: auth.stubPrisonSignIn,
    stubProbationSignIn: auth.stubProbationSignIn,
    stubProbationAcoSignIn: auth.stubProbationAcoSignIn,
    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,
    stubSystemToken: auth.systemToken,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubUpdateResponsibleCom: licence.stubUpdateResponsibleCom,
    stubUpdateProbationTeam: licence.stubUpdateProbationTeam,
    stubGetLicence: licence.stubGetLicence,
    stubPostLicence: licence.stubPostLicence,
    stubGetExistingLicenceForOffenderWithResult: licence.stubGetExistingLicenceForOffenderWithResult,
    stubGetLicencesForOffender: licence.stubGetLicencesForOffender,
    stubPutAppointmentPerson: licence.stubPutAppointmentPerson,
    stubPutAppointmentTime: licence.stubPutAppointmentTime,
    stubPutAppointmentAddress: licence.stubPutAppointmentAddress,
    stubPutContactNumber: licence.stubPutContactNumber,
    stubPutBespokeConditions: licence.stubPutBespokeConditions,
    stubPutAdditionalConditions: licence.stubPutAdditionalConditions,
    stubGetLicenceWithConditionToComplete: licence.stubGetLicenceWithConditionToComplete,
    stubGetLicenceWithPssConditionToComplete: licence.stubGetLicenceWithPssConditionToComplete,
    stubPutAdditionalConditionData: licence.stubPutAdditionalConditionData,
    stubGetExistingLicencesForOffenders: licence.stubGetExistingLicencesForOffenders,
    stubGetExistingLicenceForOffenderNoResult: licence.stubGetExistingLicenceForOffenderNoResult,
    stubSubmitStatus: licence.stubSubmitStatus,
    stubUpdateLicenceStatus: licence.stubUpdateLicenceStatus,
    stubGetLicencesForStatus: licence.stubGetLicencesForStatus,
    stubGetCompletedLicence: licence.stubGetCompletedLicence,
    stubRecordAuditEvent: licence.stubRecordAuditEvent,
    stubCreateVariation: licence.stubCreateVariation,
    stubUpdateSpoDiscussion: licence.stubUpdateSpoDiscussion,
    stubUpdateVloDiscussion: licence.stubUpdateVloDiscussion,
    stubUpdateReasonForVariation: licence.stubUpdateReasonForVariation,
    stubGetLicenceVariationInProgress: licence.stubGetLicenceVariationInProgress,
    stubDiscardLicence: licence.stubDiscardLicence,
    stubUpdatePrisonInformation: licence.stubUpdatePrisonInformation,
    stubUpdateSentenceDates: licence.stubUpdateSentenceDates,
    stubMatchLicenceEvents: licence.stubMatchLicenceEvents,
    stubApproveVariation: licence.stubApproveVariation,
    stubReferVariation: licence.stubReferVariation,
    stubGetHdcLicencesForOffender: licence.stubGetHdcLicencesForOffender,

    stubGetPduHeads: community.stubGetPduHeads,
    stubGetStaffDetails: community.stubGetStaffDetails,
    stubGetStaffDetailsByStaffId: community.stubGetStaffDetailsByStaffId,
    stubGetStaffDetailsByStaffCode: community.stubGetStaffDetailsByStaffCode,
    stubGetStaffDetailsByList: community.stubGetStaffDetailsByList,
    stubGetManagedOffenders: community.stubGetManagedOffenders,
    stubGetAnOffendersManagers: community.stubGetAnOffendersManagers,
    stubGetUserDetailsByUsername: community.stubGetUserDetailsByUsername,
    stubAssignRole: community.stubAssignRole,

    searchPrisonersByNomisIds: prisonerSearch.searchPrisonersByNomisIds,
    searchPrisonersByBookingIds: prisonerSearch.searchPrisonersByBookingIds,
    searchPrisonersByReleaseDate: prisonerSearch.searchPrisonersByReleaseDate,

    stubGetPrisonUserDetails: prison.stubGetUserDetails,
    stubGetPrisonUserCaseloads: prison.stubGetUserCaseloads,
    stubGetPrisonerDetail: prison.stubGetPrisonerDetail,
    stubGetPrisonInformation: prison.stubGetPrisonInformation,
    stubGetHdcStatus: prison.stubGetHdcStatus,
    stubGetPrisons: prison.stubGetPrisons,

    stubGetProbationer: probationSearch.stubGetProbationer,
    stubGetOffendersByCrn: probationSearch.stubGetOffendersByCrn,
    stubGetOffendersByNomsNumber: probationSearch.stubGetOffendersByNomsNumber,

    sendDomainEvent: events.sendDomainEvent,
    sendPrisonEvent: events.sendPrisonEvent,
    sendProbationEvent: events.sendProbationEvent,
    purgeQueues: events.purgeQueues,
  })
}
