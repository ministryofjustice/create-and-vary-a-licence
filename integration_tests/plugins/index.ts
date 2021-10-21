import { resetStubs } from '../wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import licence from '../mockApis/licence'
import community from '../mockApis/community'
import prisonerSearch from '../mockApis/prisonerSearch'
import prison from '../mockApis/prison'
import probationSearch from '../mockApis/probationSearch'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubPrisonSignIn: auth.stubPrisonSignIn,
    stubProbationSignIn: auth.stubProbationSignIn,
    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubGetLicence: licence.stubGetLicence,
    stubPostLicence: licence.stubPostLicence,
    stubPutAppointmentPerson: licence.stubPutAppointmentPerson,
    stubPutAppointmentTime: licence.stubPutAppointmentTime,
    stubPutAppointmentAddress: licence.stubPutAppointmentAddress,
    stubPutContactNumber: licence.stubPutContactNumber,
    stubPutBespokeConditions: licence.stubPutBespokeConditions,
    stubPutAdditionalConditions: licence.stubPutAdditionalConditions,
    stubGetLicencesByStaffIdAndStatus: licence.stubGetLicencesByStaffIdAndStatus,
    stubUpdateLicenceStatus: licence.stubUpdateLicenceStatus,
    stubGetLicencesForApproval: licence.stubGetLicencesForApproval,
    stubGetCompletedLicence: licence.stubGetCompletedLicence,

    stubGetStaffDetails: community.stubGetStaffDetails,
    stubGetManagedOffenders: community.stubGetManagedOffenders,

    searchPrisonersByNomisIds: prisonerSearch.searchPrisonersByNomisIds,

    stubGetPrisonerDetail: prison.stubGetPrisonerDetail,
    stubGetPrisonInformation: prison.stubGetPrisonInformation,

    stubGetProbationer: probationSearch.stubGetProbationer,
  })
}
