import { SimpleTime } from '../../manageConditions/types'
import CurfewTimes from './types/curfewTimes'

export const STANDARD_WEEKLY_CURFEW_TIMES: CurfewTimes = {
  curfewStart: SimpleTime.fromString('07:00 pm'),
  curfewEnd: SimpleTime.fromString('07:00 am'),
} satisfies CurfewTimes

export const STANDARD_FIRST_NIGHT_CURFEW_TIMES: CurfewTimes = {
  curfewStart: SimpleTime.fromString('03:00 pm'),
  curfewEnd: SimpleTime.fromString('07:00 am'),
} satisfies CurfewTimes
