import LicenceStatus from '../enumeration/licenceStatus'

type LicenceStatusConfig = {
  label: string
  description: string
  colour: 'green' | 'blue' | 'red' | 'pink' | 'turquoise' | 'grey' | 'yellow' | 'cyan' | 'purple'
}

const statusConfig: Record<LicenceStatus, LicenceStatusConfig> = {
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    description: 'Created and being worked on',
    colour: 'blue',
  },
  SUBMITTED: {
    label: 'SUBMITTED',
    description: 'Submitted to the prison for approval',
    colour: 'pink',
  },
  ACTIVE: {
    label: 'ACTIVE',
    description: 'Approved by the prison and is now the currently active licence',
    colour: 'turquoise',
  },
  REJECTED: {
    label: 'REJECTED',
    description: 'Rejected by the prison',
    colour: 'red',
  },
  INACTIVE: {
    label: 'INACTIVE',
    description: 'Superseded by a later licence variation',
    colour: 'grey',
  },
  RECALLED: {
    label: 'RECALLED',
    description: 'Recalled back to prison',
    colour: 'grey',
  },
  APPROVED: {
    label: 'APPROVED',
    description: 'Approved by prison',
    colour: 'green',
  },
  NOT_STARTED: {
    label: 'NOT STARTED',
    description: 'Not started',
    colour: 'grey',
  },
}

export default statusConfig
