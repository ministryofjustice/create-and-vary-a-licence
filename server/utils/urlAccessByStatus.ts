import logger from '../../logger'

const allowedPaths = [
  {
    status: 'IN_PROGRESS',
    allowed: ['/licence/create/.*', '/licence/view/.*'],
  },
  {
    status: 'SUBMITTED',
    allowed: [
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/edit.*',
      '/licence/create/id/(\\d)*/confirmation.*',
      '/licence/view/id/(\\d)*/.*',
      '/licence/approve/id/(\\d)*/.*',
    ],
  },
  {
    status: 'APPROVED',
    allowed: [
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/create/id/(\\d)*/edit.*',
      '/licence/approve/id/(\\d)*/confirm-approved.*',
      '/licence/view/id/(\\d)*/.*',
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
  },
  {
    status: 'ACTIVE',
    allowed: [
      '/licence/create/id/(\\d)*/check-your-answers.*',
      '/licence/view/id/(\\d)*/.*',
      '/licence/vary/id/(\\d)*/.*',
      '/licence/vary-approve/id/(\\d)*/approve',
    ],
  },
  {
    status: 'INACTIVE',
    allowed: ['/licence/create/id/(\\d)*/check-your-answers.*', '/licence/view/id/(\\d)*/.*'],
  },
  {
    status: 'RECALLED',
    allowed: ['/licence/create/id/(\\d)*/check-your-answers.*', '/licence/view/id/(\\d)*/.*'],
  },
  {
    status: 'VARIATION_IN_PROGRESS',
    allowed: ['/licence/create/.*', '/licence/vary/.*'],
  },
  {
    status: 'VARIATION_SUBMITTED',
    allowed: ['/licence/vary/.*', '/licence/vary-approve/.*'],
  },
  {
    status: 'VARIATION_APPROVED',
    allowed: ['/licence/vary/.*', '/licence/vary-approve/.*'],
  },
  {
    status: 'VARIATION_REJECTED',
    allowed: ['/licence/vary/.*', '/licence/vary-approve/.*'],
  },
]

/*
 * This is called within the fetchLicence middleware whilst retrieving a licence.
 * It accepts the requested URL path and the current licence status and returns true or false whether to allow.
 * It is used to prevent a user from guessing URLs in order to see or change data to which they should not have access.
 */
export default function getUrlAccessByStatus(
  path: string,
  licenceId: number,
  licenceStatus: string,
  username: string
): boolean {
  let result = false
  const rules = allowedPaths.filter(allowed => allowed.status === licenceStatus)
  if (rules.length > 0) {
    rules[0].allowed.forEach(val => {
      const regExp = new RegExp(val)
      if (regExp.test(path)) {
        logger.info(`Path allowed by rule ${val}`)
        result = true
      }
    })
  }

  if (!result) {
    logger.warn(`Denied access for ${username} to ${path} licence ID ${licenceId}, status ${licenceStatus}`)
  }

  return result
}
