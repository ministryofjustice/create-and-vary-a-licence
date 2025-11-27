import getUrlAccessByStatus from './urlAccessByStatus'

const username = 'USER1'
const licenceId = 1

const allowedPathsByStatus = {
  IN_PROGRESS: [
    '/licence/hard-stop/id/1/check-your-answers',
    '/licence/hard-stop/create/foo',
    '/licence/hard-stop/edit/foo',
    '/licence/time-served/id/1/check-your-answers',
    '/licence/time-served/create/foo',
    '/licence/time-served/edit/foo',
    '/licence/create/foo',
    '/licence/view/foo',
  ],
  SUBMITTED: [
    '/licence/hard-stop/edit/foo',
    '/licence/hard-stop/id/1/confirmation',
    '/licence/hard-stop/id/1/check-your-answers',
    '/licence/create/id/1/check-your-answers',
    '/licence/create/id/1/edit',
    '/licence/create/id/1/confirmation',
    '/licence/create/id/1/initial-meeting',
    '/licence/view/id/1/foo',
    '/licence/approve/id/1/foo',
    '/licence/create/id/1/licence-created-by-prison',
    '/licence/create/id/1/no-address-found',
    '/licence/create/id/1/select-address',
    '/licence/create/id/1/manual-address-entry',
    '/licence/time-served/create/id/1/contact-probation-team',
    '/licence/time-served/id/1/confirmation',
    '/licence/time-served/edit/foo',
    '/licence/time-served/id/1/check-your-answers',
  ],
  APPROVED: [
    '/licence/hard-stop/edit/foo',
    '/licence/hard-stop/id/1/check-your-answers',
    '/licence/create/id/1/check-your-answers',
    '/licence/create/id/1/edit',
    '/licence/create/id/1/initial-meeting',
    '/licence/approve/id/1/confirm-approved',
    '/licence/view/id/1/foo',
    '/licence/approve/id/1/probation-practitioner',
    '/licence/create/id/1/licence-created-by-prison',
    '/licence/create/id/1/licence-changes-not-approved-in-time',
    '/licence/create/id/1/no-address-found',
    '/licence/create/id/1/select-address',
    '/licence/create/id/1/manual-address-entry',
    '/licence/time-served/id/1/confirmation',
    '/licence/time-served/edit/foo',
    '/licence/time-served/id/1/check-your-answers',
  ],
  REJECTED: [
    '/licence/create/id/1/check-your-answers',
    '/licence/create/id/1/edit',
    '/licence/approve/id/1/confirm-rejected',
    '/licence/view/id/1/foo',
  ],
  ACTIVE: [
    '/licence/create/id/1/check-your-answers',
    '/licence/create/id/1/licence-created-by-prison',
    '/licence/view/id/1/foo',
    '/licence/vary/id/1/foo',
    '/licence/vary-approve/id/1/approve',
    '/licence/approve/id/1/probation-practitioner',
  ],
  INACTIVE: ['/licence/create/id/1/check-your-answers', '/licence/view/id/1/foo', '/licence/vary/id/1/foo'],
  RECALLED: ['/licence/create/id/1/check-your-answers', '/licence/view/id/1/foo'],
  VARIATION_IN_PROGRESS: ['/licence/create/foo', '/licence/vary/foo'],
  VARIATION_SUBMITTED: ['/licence/vary/foo', '/licence/vary-approve/foo'],
  VARIATION_APPROVED: ['/licence/vary/foo', '/licence/vary-approve/foo'],
  VARIATION_REJECTED: ['/licence/vary/foo', '/licence/vary-approve/foo'],
  TIMED_OUT: ['/licence/create/nomisId/123/prison-will-create-this-licence'],
}

const disallowedPathsByStatus: Record<string, readonly string[]> = {
  IN_PROGRESS: ['/licence/view/id/1/pdf-print'],
  SUBMITTED: ['/licence/view/id/1/pdf-print'],
  REJECTED: ['/licence/view/id/1/pdf-print'],
  RECALLED: ['/licence/view/id/1/pdf-print'],
  VARIATION_IN_PROGRESS: ['/licence/view/id/1/pdf-print'],
  VARIATION_SUBMITTED: ['/licence/view/id/1/pdf-print'],
  VARIATION_REJECTED: ['/licence/view/id/1/pdf-print'],
}

describe('URL access checks by licence status', () => {
  ;(Object.keys(allowedPathsByStatus) as Array<keyof typeof allowedPathsByStatus>).forEach(status => {
    describe(`${status} paths`, () => {
      const allowedPaths = allowedPathsByStatus[status]
      if (allowedPaths && allowedPaths.length > 0) {
        describe('Allowed paths', () => {
          allowedPaths.forEach(path => {
            it(`should allow ${path}`, () => {
              // Given
              const testPath = path
              // When
              const result = getUrlAccessByStatus(testPath, licenceId, status, username)
              // Then
              expect(result).toBe(true)
            })
          })
        })
      }

      const disallowedPaths = disallowedPathsByStatus[status] || []
      if (disallowedPaths.length > 0) {
        describe('Disallowed paths', () => {
          disallowedPaths.forEach(path => {
            it(`should deny ${path}`, () => {
              // Given
              const testPath = path
              // When
              const result = getUrlAccessByStatus(testPath, licenceId, status, username)
              // Then
              expect(result).toBe(false)
            })
          })
        })
      }
    })
  })
})
