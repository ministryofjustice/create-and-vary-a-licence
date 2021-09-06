export enum LicenceStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUPERSEDED = 'SUPERSEDED',
}

type LicenceStatusConfig = {
  label: string
  description: string
  colour: 'green' | 'blue' | 'red' | 'turquoise' | 'grey'
}

export const statusConfig: Record<LicenceStatus, LicenceStatusConfig> = {
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    description: 'Created and being worked on',
    colour: 'turquoise',
  },
  SUBMITTED: {
    label: 'SUBMITTED',
    description: 'Submitted to the prison for approval',
    colour: 'blue',
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
