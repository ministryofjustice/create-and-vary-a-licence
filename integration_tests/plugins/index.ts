import { resetStubs } from '../wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import licence from '../mockApis/licence'
import community from '../mockApis/community'
import prison from '../mockApis/prisonerSearch'
import prisonRegister from '../mockApis/prisonRegister'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: auth.stubSignIn,
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

    stubGetStaffDetails: community.stubGetStaffDetails,
    stubGetManagedOffenders: community.stubGetManagedOffenders,

    searchPrisonersByNomisIds: prison.searchPrisonersByNomisIds,

    stubGetPrisonDescription: prisonRegister.stubGetPrisonDescription,
  })
}
