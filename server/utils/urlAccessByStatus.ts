import logger from '../../logger'

type AllowedPathByStatusConfig = {
  status: string
  allowed?: string[]
  disallowed?: string[]
}

const allowedPaths = [
  {
    status: 'IN_PROGRESS',
    allowed: [
      '/licence/hard-stop/id/(\\d)*/check-your-answers.*',
      '/licence/hard-stop/create/.*',
      '/licence/hard-stop/edit/.*',
      '/licence/time-served/id/(\\d)*/check-your-answers.*',
      '/licence/time-served/create/.*',
      '/licence/time-served/edit/.*',
      '/licence/create/.*',
      '/licence/view/.*',
    ],
    disallowed: ['/licence/view/id/(\\d)/pdf-print'],
  },
  {
    status: 'SUBMITTED',
    allowed: [
      '/licence/hard-stop/edit/.*',
      '/licence/hard-stop/id/(\\d)*/confirmation.*',
      '/licence/hard-stop/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/edit.*',
      '/licence/create/id/(\\d)*/confirmation.*',
      '/licence/create/id/(\\d)*/initial-meeting.*',
      '/licence/view/id/(\\d)*/.*',
      '/licence/approve/id/(\\d)*/.*',
      '/licence/create/id/(\\d)*/licence-created-by-prison',
      '/licence/create/id/(\\d)*/no-address-found.*',
      '/licence/create/id/(\\d)*/select-address.*',
      '/licence/create/id/(\\d)*/manual-address-entry.*',
      '/licence/time-served/create/id/(\\d)*/contact-probation-team',
      '/licence/time-served/id/(\\d)*/confirmation.*',
      '/licence/time-served/edit/.*',
      '/licence/time-served/id/(\\d)*/check-your-answers.*',
    ],
    disallowed: ['/licence/view/id/(\\d)/pdf-print'],
  },
  {
    status: 'APPROVED',
    allowed: [
      '/licence/hard-stop/edit/.*',
      '/licence/hard-stop/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/edit.*',
      '/licence/create/id/(\\d)*/initial-meeting.*',
      '/licence/approve/id/(\\d)*/confirm-approved.*',
      '/licence/view/id/(\\d)*/.*',
      '/licence/approve/id/(\\d)*/probation-practitioner.*',
      '/licence/create/id/(\\d)*/licence-created-by-prison',
      '/licence/create/id/(\\d)*/licence-changes-not-approved-in-time',
      '/licence/create/id/(\\d)*/no-address-found.*',
      '/licence/create/id/(\\d)*/select-address.*',
      '/licence/create/id/(\\d)*/manual-address-entry.*',
      '/licence/time-served/id/(\\d)*/confirmation.*',
      '/licence/time-served/edit/.*',
      '/licence/time-served/id/(\\d)*/check-your-answers.*',
    ],
  },
  {
    status: 'REJECTED',
    allowed: [
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/edit.*',
      '/licence/approve/id/(\\d)*/confirm-rejected.*',
      '/licence/view/id/(\\d)*/.*',
    ],
    disallowed: ['/licence/view/id/(\\d)/pdf-print'],
  },
  {
    status: 'ACTIVE',
    allowed: [
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/licence-created-by-prison',
      '/licence/view/id/(\\d)*/.*',
      '/licence/vary/id/(\\d)*/.*',
      '/licence/vary-approve/id/(\\d)*/approve',
      '/licence/approve/id/(\\d)*/probation-practitioner.*',
    ],
  },
  {
    status: 'INACTIVE',
    allowed: [
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/view/id/(\\d)*/.*',
      '/licence/vary/id/(\\d)*/.*',
    ],
  },
  {
    status: 'RECALLED',
    allowed: ['/licence/create/id/(\\d)*/check-your-answers.*', '/licence/view/id/(\\d)*/.*'],
    disallowed: ['/licence/view/id/(\\d)/pdf-print'],
  },
  {
    status: 'VARIATION_IN_PROGRESS',
    allowed: ['/licence/create/.*', '/licence/vary/.*'],
    disallowed: ['/licence/view/id/(\\d)/pdf-print'],
  },
  {
    status: 'VARIATION_SUBMITTED',
    allowed: ['/licence/vary/.*', '/licence/vary-approve/.*'],
    disallowed: ['/licence/view/id/(\\d)/pdf-print'],
  },
  {
    status: 'VARIATION_APPROVED',
    allowed: ['/licence/vary/.*', '/licence/vary-approve/.*'],
  },
  {
    status: 'VARIATION_REJECTED',
    allowed: ['/licence/vary/.*', '/licence/vary-approve/.*'],
    disallowed: ['/licence/view/id/(\\d)/pdf-print'],
  },
  {
    status: 'TIMED_OUT',
    allowed: ['/licence/create/nomisId/.*/prison-will-create-this-licence'],
  },
] as AllowedPathByStatusConfig[]

/*
 * This is called within the fetchLicence middleware whilst retrieving a licence.
 * It accepts the requested URL path and the current licence status and returns true or false whether to allow.
 * It is used to prevent a user from guessing URLs in order to see or change data to which they should not have access.
 */
export default function getUrlAccessByStatus(
  path: string,
  licenceId: number,
  licenceStatus: string,
  username: string,
): boolean {
  let result = false
  const rules = allowedPaths.filter(allowed => allowed.status === licenceStatus)
  if (rules.length > 0) {
    rules[0].allowed?.forEach(val => {
      const regExp = new RegExp(val)
      if (regExp.test(path)) {
        logger.info(`Path allowed by rule ${val}`)
        result = true
      }
    })
    rules[0].disallowed?.forEach(val => {
      const regExp = new RegExp(val)
      if (regExp.test(path)) {
        logger.info(`Path disallowed by rule ${val}`)
        result = false
      }
    })
  }

  if (!result) {
    logger.warn(`Denied access for ${username} to ${path} licence ID ${licenceId}, status ${licenceStatus}`)
  }

  return result
}
