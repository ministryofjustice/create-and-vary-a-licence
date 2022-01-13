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
    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,
    stubSystemToken: auth.systemToken,

    stubTokenVerificationPing: tokenVerification.stubPing,

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

    stubGetStaffDetails: community.stubGetStaffDetails,
    stubGetManagedOffenders: community.stubGetManagedOffenders,

    searchPrisonersByNomisIds: prisonerSearch.searchPrisonersByNomisIds,

    stubGetPrisonUserDetails: prison.stubGetUserDetails,
    stubGetPrisonUserCaseloads: prison.stubGetUserCaseloads,
    stubGetPrisonerDetail: prison.stubGetPrisonerDetail,
    stubGetPrisonInformation: prison.stubGetPrisonInformation,
    stubGetHdcStatus: prison.stubGetHdcStatus,

    stubGetProbationer: probationSearch.stubGetProbationer,

    sendDomainEvent: events.sendDomainEvent,
    sendPrisonEvent: events.sendPrisonEvent,
    sendProbationEvent: events.sendProbationEvent,
    purgeQueues: events.purgeQueues,
  })
}
