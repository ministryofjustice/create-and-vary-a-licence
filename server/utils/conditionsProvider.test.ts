import { getGroupedAdditionalConditions } from './conditionsProvider'

jest.mock('../config/conditions', () => ({
  additionalConditions: [
    {
      id: 'test1',
      groupName: 'group1',
    },
    {
      id: 'test2',
      groupName: 'group2',
    },
    {
      id: 'test3',
      groupName: 'group2',
    },
  ],
}))

describe('Conditions Provider', () => {
  describe('getGroupedAdditionalConditions', () => {
    it('should return the list of additional conditions grouped by group name', () => {
      expect(getGroupedAdditionalConditions()).toEqual([
        { groupName: 'group1', conditions: [{ groupName: 'group1', id: 'test1' }] },
        {
          groupName: 'group2',
          conditions: [
            { groupName: 'group2', id: 'test2' },
            { groupName: 'group2', id: 'test3' },
          ],
        },
      ])
    })
  })
})
