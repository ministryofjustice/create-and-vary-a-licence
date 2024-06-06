import { addDays, format } from 'date-fns'
import CaseListUtils from './caselistUtils'

const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
const nineDaysFromNow = format(addDays(new Date(), 9), 'yyyy-MM-dd')
const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')

describe('Is Parole Eligible', () => {
  it('returns FALSE when PED is not set', () => {
    expect(CaseListUtils.isParoleEligible(null)).toBeFalsy()
  })
  it('returns TRUE when PED is in the future', () => {
    expect(CaseListUtils.isParoleEligible(tenDaysFromNow)).toBeTruthy()
  })
  it('returns FALSE when PED is in the past', () => {
    expect(CaseListUtils.isParoleEligible(yesterday)).toBeFalsy()
  })
  it('returns FALSE when PED is not valid', () => {
    expect(CaseListUtils.isParoleEligible('aaa')).toBeFalsy()
  })
})

describe('#isEligibleEDS', () => {
  it('returns true when PED is not set', () => {
    expect(CaseListUtils.isEligibleEDS(null, null, null, null)).toBe(true)
  })
  it('returns false when PED is set and CRD is not', () => {
    expect(CaseListUtils.isEligibleEDS(yesterday, null, null, null)).toBe(false)
  })
  it('returns false when PED is in the future', () => {
    expect(CaseListUtils.isEligibleEDS(nineDaysFromNow, tenDaysFromNow, null, null)).toBe(false)
  })
  it('returns true if past PED and ARD is within 4 days of CRD', () => {
    expect(
      CaseListUtils.isEligibleEDS(yesterday, tenDaysFromNow, format(addDays(new Date(), 6), 'yyyy-MM-dd'), null)
    ).toBe(true)
  })
  it('returns true if past PED and ARD is equal to CRD', () => {
    expect(CaseListUtils.isEligibleEDS(yesterday, tenDaysFromNow, tenDaysFromNow, null)).toBe(true)
  })
  it('returns false if past PED and ARD is more than 4 days before CRD', () => {
    expect(
      CaseListUtils.isEligibleEDS(yesterday, tenDaysFromNow, format(addDays(new Date(), 5), 'yyyy-MM-dd'), null)
    ).toBe(false)
  })
  it('returns true if past PED and ARD not set', () => {
    expect(CaseListUtils.isEligibleEDS(yesterday, tenDaysFromNow, null, null)).toBe(true)
  })
  it('returns false if APD is set', () => {
    expect(CaseListUtils.isEligibleEDS(yesterday, tenDaysFromNow, tenDaysFromNow, nineDaysFromNow)).toBe(false)
  })
})
