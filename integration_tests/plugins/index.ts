import { resetStubs } from '../wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import licence from '../mockApis/licence'

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
  })
}
