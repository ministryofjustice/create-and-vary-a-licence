import { getGroupedAdditionalConditions, getStandardConditions } from './conditionsProvider'

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
  },
  additionalConditions: [
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
}))

describe('Conditions Provider', () => {
  describe('getGroupedAdditionalConditions', () => {
    it('should return the list of additional conditions grouped by group name', () => {
      expect(getGroupedAdditionalConditions()).toEqual([
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
    })

    it('should throw exception for an unrecognised licence type', () => {
      expect(() => getStandardConditions('unknown')).toThrow("No licence type found with code : 'unknown'")
    })
  })
})
