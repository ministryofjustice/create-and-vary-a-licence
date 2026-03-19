/**
 * Type-safe test utilities for creating stubbed Request and Response objects
 * in handler tests. All mocks are accessible as properties of the returned objects.
 */

import { NextFunction, Request, Response } from 'express'
import { CvlUserDetails } from '../@types/CvlUserDetails'

// ============================================================================
// Type definitions for stubbed objects with accessible mocks
// ============================================================================

/**
 * A Request object with all mock methods properly typed for assertion
 */
export type StubbedRequest = Request & {
  // Add any Request-related mocks here if needed in future
}

/**
 * A Response object with all mock methods properly typed for assertion
 * This allows assertions like: expect(res.render).toHaveBeenCalledWith(...)
 */
export type StubbedResponse = Omit<Response, 'render' | 'redirect' | 'json' | 'status' | 'send'> & {
  render: jest.Mock
  redirect: jest.Mock
  json: jest.Mock
  status: jest.Mock
  send: jest.Mock
  locals: {
    user?: CvlUserDetails & { username: string; token: string; authSource: string; userRoles: string[]; uuid: string }
    licence?: unknown
    [key: string]: unknown
  }
}

// ============================================================================
// Core Factory Functions - Basic Request/Response
// ============================================================================

/**
 * Creates a stubbed Request object with default values
 * @param overrides - properties to override defaults
 */
export const createRequest = (overrides: Partial<StubbedRequest> = {}): StubbedRequest => {
  return {
    params: {},
    query: {},
    body: {},
    session: {},
    user: undefined,
    ...overrides,
  } as StubbedRequest
}

/**
 * Creates a stubbed Response object with jest mocks for all methods
 * All mocks are accessible as properties for verification
 * @param overrides - properties to override defaults
 */
export const createResponse = (overrides: Partial<StubbedResponse> = {}): StubbedResponse => {
  const render = jest.fn()
  const redirect = jest.fn()
  const json = jest.fn()
  const status = jest.fn().mockReturnThis()
  const send = jest.fn()

  return {
    render,
    redirect,
    json,
    status,
    send,
    locals: {
      user: undefined,
      licence: undefined,
    },
    ...overrides,
  } as StubbedResponse
}

// ============================================================================
// User Factory Functions - Reusable User Objects
// ============================================================================

export interface UserOptions extends Partial<CvlUserDetails> {
  username?: string
  token?: string
  userRoles?: string[]
  uuid?: string
  authSource?: string
}

/**
 * Creates a default user object with optional overrides
 * Useful for creating consistent user objects across tests
 */
export const createUser = (
  overrides: UserOptions = {},
): CvlUserDetails & { username: string; token: string; authSource: string; userRoles: string[]; uuid: string } => {
  return {
    username: 'testuser',
    token: 'test-token-123',
    uuid: 'test-uuid',
    ...overrides,
  } as CvlUserDetails & { username: string; token: string; authSource: string; userRoles: string[]; uuid: string }
}

/**
 * Creates a probation user (COM) with team details
 */
export const createProbationUser = (
  overrides: UserOptions = {},
): CvlUserDetails & { username: string; token: string; authSource: string; userRoles: string[]; uuid: string } => {
  return createUser({
    isProbationUser: true,
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    probationTeams: [
      { code: 'teamA', label: 'Team A' },
      { code: 'teamB', label: 'Team B' },
    ],
    ...overrides,
  })
}

/**
 * Creates a prison user (ACO/approver)
 */
export const createPrisonUser = (
  overrides: UserOptions = {},
): CvlUserDetails & { username: string; token: string; authSource: string; userRoles: string[]; uuid: string } => {
  return createUser({
    isProbationUser: false,
    nomisStaffId: 1000,
    activeCaseload: 'MDI',
    prisonCaseload: ['MDI', 'LEI'],
    userRoles: ['ROLE_LICENCE_ACO'],
    ...overrides,
  })
}

// ============================================================================
// Combined Request & Response Factories - Simple Entry Point
// ============================================================================

/**
 * Creates both request and response together for a typical handler test
 * Returns an object with req and res properties
 * Pass user and licence objects directly - no mutation after creation
 *
 * @example
 * const { req, res } = createRequestAndResponse({
 *   user: createProbationUser({ username: 'USER1' }),
 *   session: { teamSelection: ['teamA'] }
 * })
 */
export const createRequestAndResponse = (
  options: {
    req?: {
      licenceId?: string | number
      params?: Record<string, unknown>
      body?: Record<string, unknown>
      query?: Record<string, unknown>
      session?: Record<string, unknown>
      [key: string]: unknown
    }
    res?: {
      user?: CvlUserDetails & { username: string; token: string; authSource: string; userRoles: string[]; uuid: string }
      licence?: Record<string, unknown>
      [key: string]: unknown
    }
  } = {},
): { req: StubbedRequest; res: StubbedResponse; next: jest.Mock } => {
  const { req: reqOptions = {}, res: resOptions = {} } = options
  const { licenceId, params, body, query, session, ...restReq } = reqOptions
  const { user, licence, ...restLocals } = resOptions

  const req = createRequest({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: (licenceId ? { licenceId: String(licenceId) } : params) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: query as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: body as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: session as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(restReq as any),
  })

  const res = createResponse()
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.locals.user = user as any
  }
  if (licence) {
    res.locals.licence = licence
  }
  Object.assign(res.locals, restLocals)

  const next = jest.fn() as jest.Mock & NextFunction

  return { req, res, next }
}
