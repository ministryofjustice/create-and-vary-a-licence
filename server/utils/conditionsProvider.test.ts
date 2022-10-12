import {
  additionalConditionsCollection,
  currentOrNextSequenceForCondition,
  getAdditionalConditionByCode,
  getGroupedAdditionalConditions,
  getStandardConditions,
} from './conditionsProvider'
import LicenceType from '../enumeration/licenceType'
import { AdditionalCondition } from '../@types/licenceApiClientTypes'

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

  describe('currentOrNextSequenceForCondition', () => {
    const conditions = [
      { code: 'AAA', sequence: 1, text: 'test', category: 'test', data: [], uploadSummary: [] },
      { code: 'BBB', sequence: 2, text: 'test', category: 'test', data: [], uploadSummary: [] },
      { code: 'CCC', sequence: 3, text: 'test', category: 'test', data: [], uploadSummary: [] },
      { code: 'DDD', sequence: 4, text: 'test', category: 'test', data: [], uploadSummary: [] },
    ] as AdditionalCondition[]

    it('should return sequence belonging to existing condition based on condition code', () => {
      expect(currentOrNextSequenceForCondition(conditions, 'CCC')).toEqual(3)
    })

    it('should return next sequence if no existing condition is found', () => {
      expect(currentOrNextSequenceForCondition(conditions, 'ZZZ')).toEqual(5)
    })

    it('should return 1 if not existing conditions are present', () => {
      expect(currentOrNextSequenceForCondition([], 'ZZZ')).toEqual(1)
    })
  })

  describe('additionalConditionsCollection', () => {
    const conditions = [
      { id: 1, code: 'AAA', sequence: 1, text: 'test', category: 'test', data: [], uploadSummary: [] },
      { id: 2, code: 'BBB', sequence: 2, text: 'test', category: 'test', data: [], uploadSummary: [] },
      { id: 3, code: 'CCC', sequence: 3, text: 'test', category: 'test', data: [], uploadSummary: [{}] },
      { id: 4, code: 'DDD', sequence: 4, text: 'test', category: 'test', data: [], uploadSummary: [] },
    ] as AdditionalCondition[]

    it('should return additional conditions with and without uploads ', () => {
      const { conditionsWithUploads, additionalConditions } = additionalConditionsCollection(conditions)
      expect(conditionsWithUploads.length).toEqual(1)
      expect(conditionsWithUploads).toEqual([conditions[2]])
      expect(additionalConditions.length).toEqual(3)
      expect(additionalConditions).toEqual([conditions[0], conditions[1], conditions[3]])
    })
  })
})
