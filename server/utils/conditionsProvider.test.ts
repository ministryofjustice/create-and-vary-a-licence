import { getGroupedAdditionalConditions } from './conditionsProvider'

jest.mock('../config/conditions', () => ({
  additionalConditions: [
    {
      id: 'test1',
      category: 'group1',
    },
    {
      id: 'test2',
      category: 'group2',
    },
    {
      id: 'test3',
      category: 'group2',
    },
  ],
}))

describe('Conditions Provider', () => {
  describe('getGroupedAdditionalConditions', () => {
    it('should return the list of additional conditions grouped by group name', () => {
      expect(getGroupedAdditionalConditions()).toEqual([
        { category: 'group1', conditions: [{ category: 'group1', id: 'test1' }] },
        {
          category: 'group2',
          conditions: [
            { category: 'group2', id: 'test2' },
            { category: 'group2', id: 'test3' },
          ],
        },
      ])
    })
  })
})
