import {
  getAdditionalConditionByCode,
  getGroupedAdditionalConditions,
  getStandardConditions,
} from './conditionsProvider'
import LicenceType from '../enumeration/licenceType'

jest.mock('../config/conditions', () => ({
  standardConditions: {
    AP: [
      {
        code: 'code1',
      },
      {
        code: 'code2',
      },
      {
        code: 'code3',
      },
    ],
    PSS: [
      {
        code: 'code4',
      },
      {
        code: 'code5',
      },
      {
        code: 'code6',
      },
    ],
  },
  additionalConditions: {
    AP: [
      {
        code: 'code1',
        category: 'group1',
      },
      {
        code: 'code2',
        category: 'group2',
      },
      {
        code: 'code3',
        category: 'group2',
      },
    ],
    PSS: [
      {
        code: 'code1',
        category: 'group1',
      },
      {
        code: 'code2',
        category: 'group2',
      },
      {
        code: 'code3',
        category: 'group2',
      },
    ],
  },
}))

describe('Conditions Provider', () => {
  describe('getGroupedAdditionalConditions', () => {
    it('should return the list of additional conditions grouped by group name', () => {
      expect(getGroupedAdditionalConditions(<LicenceType>'AP')).toEqual([
        { category: 'group1', conditions: [{ category: 'group1', code: 'code1' }] },
        {
          category: 'group2',
          conditions: [
            { category: 'group2', code: 'code2' },
            { category: 'group2', code: 'code3' },
          ],
        },
      ])
    })
  })

  describe('getAdditionalConditionByCode', () => {
    it('should the additional condition which matches the given code', () => {
      expect(getAdditionalConditionByCode('code1')).toEqual({ category: 'group1', code: 'code1' })
    })

    it('should return undefined if a matching additional condition is not found', () => {
      expect(getAdditionalConditionByCode('unknown')).toBeUndefined()
    })
  })

  describe('getStandardConditions', () => {
    it('should return the list of standard condition with sequence numbers', () => {
      expect(getStandardConditions('AP')).toEqual([
        {
          code: 'code1',
          sequence: 0,
        },
        {
          code: 'code2',
          sequence: 1,
        },
        {
          code: 'code3',
          sequence: 2,
        },
      ])
      expect(getStandardConditions('PSS')).toEqual([
        {
          code: 'code4',
          sequence: 0,
        },
        {
          code: 'code5',
          sequence: 1,
        },
        {
          code: 'code6',
          sequence: 2,
        },
      ])
    })
  })
})
