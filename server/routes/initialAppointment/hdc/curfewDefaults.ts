import { SimpleTime } from '../../manageConditions/types'
import CurfewTimes from './types/curfewTimes'

const STANDARD_CURFEW_TIMES = {
  curfewStart: SimpleTime.fromString('07:00 pm'),
  curfewEnd: SimpleTime.fromString('07:00 am'),
} satisfies CurfewTimes

export default STANDARD_CURFEW_TIMES
