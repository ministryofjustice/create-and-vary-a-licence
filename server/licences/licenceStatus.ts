import LicenceStatus from '../enumeration/licenceStatus'

type LicenceStatusConfig = {
  label: string
  description: string
  colour: 'green' | 'blue' | 'red' | 'pink' | 'turquoise' | 'grey' | 'yellow' | 'cyan' | 'purple'
}

const statusConfig: Record<LicenceStatus, LicenceStatusConfig> = {
  IN_PROGRESS: {
    label: 'In progress',
    description: 'Created and being worked on',
    colour: 'blue',
  },
  SUBMITTED: {
    label: 'Submitted',
    description: 'Submitted to the prison for approval',
    colour: 'pink',
  },
  ACTIVE: {
    label: 'Active',
    description: 'Approved by the prison and is now the currently active licence',
    colour: 'turquoise',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Rejected by the prison',
    colour: 'red',
  },
  INACTIVE: {
    label: 'Inactive',
    description: 'Superseded by a later licence variation',
    colour: 'grey',
  },
  RECALLED: {
    label: 'Recalled',
    description: 'Recalled back to prison',
    colour: 'grey',
  },
  APPROVED: {
    label: 'Approved',
    description: 'Approved by prison',
    colour: 'green',
  },
  NOT_STARTED: {
    label: 'Not started',
    description: 'Not started',
    colour: 'grey',
  },
  VARIATION_IN_PROGRESS: {
    label: 'Variation in progress',
    description: 'Variation in progress',
    colour: 'blue',
  },
  VARIATION_SUBMITTED: {
    label: 'Variation submitted',
    description: 'Variation submitted for approval',
    colour: 'pink',
  },
  VARIATION_APPROVED: {
    label: 'Variation approved',
    description: 'Variation submitted for approval',
    colour: 'yellow',
  },
  VARIATION_REJECTED: {
    label: 'Referred by aco',
    description: 'Variation submitted for approval',
    colour: 'pink',
  },
  NOT_IN_PILOT: {
    label: 'Outside pilot',
    description: 'Outside pilot area',
    colour: 'grey',
  },
}

export default statusConfig
