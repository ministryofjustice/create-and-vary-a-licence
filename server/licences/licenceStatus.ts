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
    colour: 'yellow',
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
    label: 'Attention needed',
    description: 'Feedback from Head of PDU received',
    colour: 'red',
  },
  NOT_IN_PILOT: {
    label: 'Outside pilot',
    description: 'Outside pilot area',
    colour: 'grey',
  },
  OOS_BOTUS: {
    label: 'Breach of supervision',
    description: 'Breach of supervision',
    colour: 'grey',
  },
  OOS_RECALL: {
    label: 'Recall',
    description: 'Recall',
    colour: 'grey',
  },
  TIMED_OUT: {
    label: 'Timed Out',
    description: 'Timed Out',
    colour: 'grey',
  },
  REVIEW_NEEDED: {
    label: 'Review needed',
    description: 'Review needed',
    colour: 'red',
  },
  NOMIS_LICENCE: {
    label: 'NOMIS licence',
    description: 'NOMIS licence',
    colour: 'grey',
  },
}

export default statusConfig
