import LicenceStatus from '../enumeration/licenceStatus'

type LicenceStatusConfig = {
  label: string
  description: string
  colour: 'green' | 'blue' | 'red' | 'amber' | 'grey'
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
    colour: 'amber',
  },
  ACTIVE: {
    label: 'ACTIVE',
    description: 'Approved by the prison and is now the currently active licence',
    colour: 'green',
  },
  REJECTED: {
    label: 'REJECTED',
    description: 'Rejected by the prison',
    colour: 'red',
  },
  SUPERSEDED: {
    label: 'SUPERSEDED',
    description: 'Superseded by a later licence variation',
    colour: 'grey',
  },
}

export default statusConfig
