import jwt from 'jsonwebtoken'
import { Response } from 'superagent'

import { stubFor, getRequests } from '../wiremock'
import licence from './licence'
import tokenVerification from './tokenVerification'
import manageUsers from './manageUsers'

const createToken = (authorities: string[], authSource: string) => {
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: authSource,
    authorities,
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getSignInUrl = (): Promise<string> =>
  getRequests().then(data => {
    const { requests } = data.body
    const stateParam = requests[0].request.queryParams.state
    const stateValue = stateParam ? stateParam.values[0] : requests[1].request.queryParams.state.values[0]
    return `/login/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/login/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html lang=""><body id="sign-in-page">SignIn page<h1>Sign in</h1></body></html>',
    },
  })

const signOut = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/sign-out.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html lang=""><body id="sign-in-page">SignIn page<h1>Sign in</h1></body></html>',
    },
  })

const token = (authorities: string[], authSource: string) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/login/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(authorities, authSource),
        token_type: 'bearer',
        user_name: 'USER1',
        auth_source: authSource,
        authorities,
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })
export default {
  getSignInUrl,
  stubPing: (): Promise<[Response, Response]> => Promise.all([ping(), tokenVerification.stubTokenVerificationPing()]),
  stubProbationSignIn: (): Promise<[Response, Response, Response, Response, Response, Response, Response]> =>
    Promise.all([
      favicon(),
      redirect(),
      signOut(),
      token(['ROLE_LICENCE_RO'], 'delius'),
      tokenVerification.stubVerifyToken(),
      licence.updateComDetails(),
      manageUsers.stubUserEmail(),
    ]),
  stubProbationAcoSignIn: (): Promise<[Response, Response, Response, Response, Response, Response, Response]> =>
    Promise.all([
      favicon(),
      redirect(),
      signOut(),
      token(['ROLE_LICENCE_ACO'], 'delius'),
      tokenVerification.stubVerifyToken(),
      licence.updateComDetails(),
      manageUsers.stubUserEmail(),
    ]),
  systemToken: () => token(null, 'auth'),
  stubPrisonSignIn: (): Promise<[Response, Response, Response, Response, Response, Response, Response]> =>
    Promise.all([
      favicon(),
      redirect(),
      signOut(),
      token(['ROLE_LICENCE_DM', 'ROLE_LICENCE_CA'], 'nomis'),
      tokenVerification.stubVerifyToken(),
      licence.stubUpdatePrisonUserDetails(),
      manageUsers.stubUserEmail(),
    ]),
}
