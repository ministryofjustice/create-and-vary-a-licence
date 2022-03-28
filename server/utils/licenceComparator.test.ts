import _ from 'lodash'
import compareLicenceConditions from './licenceComparator'
import { Licence } from '../@types/licenceApiClientTypes'

const licenceTemplate = {
  additionalLicenceConditions: [],
  additionalPssConditions: [],
  bespokeConditions: [],
} as Licence

describe('Licence Comparator', () => {
  describe('Licence conditions', () => {
    it('should return list of removed licence conditions', () => {
      const originalLicence = {
        ...licenceTemplate,
        additionalLicenceConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'testCondition1',
          },
          {
            code: '2',
            category: 'category2',
            text: 'testCondition2',
          },
        ],
        bespokeConditions: [{ text: 'bespoke1' }, { text: 'bespoke2' }],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalLicenceConditions: [],
      } as Licence

      expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
        licenceConditionsAdded: [],
        licenceConditionsAmended: [],
        licenceConditionsRemoved: [
          {
            category: 'category1',
            condition: 'testCondition1',
          },
          {
            category: 'category2',
            condition: 'testCondition2',
          },
          {
            category: 'Bespoke condition',
            condition: 'bespoke1',
          },
          {
            category: 'Bespoke condition',
            condition: 'bespoke2',
          },
        ],
        pssConditionsAdded: [],
        pssConditionsAmended: [],
        pssConditionsRemoved: [],
      })
    })

    it('should return list of added licence conditions', () => {
      const originalLicence = {
        ...licenceTemplate,
        additionalLicenceConditions: [],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalLicenceConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'testCondition1',
          },
          {
            code: '2',
            category: 'category2',
            text: 'testCondition2',
          },
        ],
        bespokeConditions: [{ text: 'bespoke1' }, { text: 'bespoke2' }],
      } as Licence

      expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
        licenceConditionsAdded: [
          {
            category: 'category1',
            condition: 'testCondition1',
          },
          {
            category: 'category2',
            condition: 'testCondition2',
          },
          {
            category: 'Bespoke condition',
            condition: 'bespoke1',
          },
          {
            category: 'Bespoke condition',
            condition: 'bespoke2',
          },
        ],
        licenceConditionsAmended: [],
        licenceConditionsRemoved: [],
        pssConditionsAdded: [],
        pssConditionsAmended: [],
        pssConditionsRemoved: [],
      })
    })

    it('should return list of amended licence conditions', () => {
      const originalLicence = {
        ...licenceTemplate,
        additionalLicenceConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'testCondition1',
          },
        ],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalLicenceConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'amendedTestCondition1',
          },
        ],
      } as Licence

      expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
        licenceConditionsAdded: [],
        licenceConditionsAmended: [
          {
            category: 'category1',
            condition: 'amendedTestCondition1',
          },
        ],
        licenceConditionsRemoved: [],
        pssConditionsAdded: [],
        pssConditionsAmended: [],
        pssConditionsRemoved: [],
      })
    })
  })

  describe('PSS conditions', () => {
    it('should return list of removed pss conditions', () => {
      const originalLicence = {
        ...licenceTemplate,
        additionalPssConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'testCondition1',
          },
        ],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalPssConditions: [],
      } as Licence

      expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
        licenceConditionsAdded: [],
        licenceConditionsAmended: [],
        licenceConditionsRemoved: [],
        pssConditionsAdded: [],
        pssConditionsAmended: [],
        pssConditionsRemoved: [
          {
            category: 'category1',
            condition: 'testCondition1',
          },
        ],
      })
    })

    it('should return list of added pss conditions', () => {
      const originalLicence = {
        ...licenceTemplate,
        additionalPssConditions: [],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalPssConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'testCondition1',
          },
        ],
      } as Licence

      expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
        licenceConditionsAdded: [],
        licenceConditionsAmended: [],
        licenceConditionsRemoved: [],
        pssConditionsAdded: [
          {
            category: 'category1',
            condition: 'testCondition1',
          },
        ],
        pssConditionsAmended: [],
        pssConditionsRemoved: [],
      })
    })

    it('should return list of amended pss conditions', () => {
      const originalLicence = {
        ...licenceTemplate,
        additionalPssConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'testCondition1',
          },
        ],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalPssConditions: [
          {
            code: '1',
            category: 'category1',
            text: 'amendedTestCondition1',
          },
        ],
      } as Licence

      expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
        licenceConditionsAdded: [],
        licenceConditionsAmended: [],
        licenceConditionsRemoved: [],
        pssConditionsAdded: [],
        pssConditionsAmended: [
          {
            category: 'category1',
            condition: 'amendedTestCondition1',
          },
        ],
        pssConditionsRemoved: [],
      })
    })
  })

  it('should return no changes if the licence has not changed', () => {
    const originalLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          text: 'testCondition1',
        },
      ],
      bespokeConditions: [{ text: 'bespoke1' }],
    } as Licence

    expect(compareLicenceConditions(originalLicence, _.cloneDeep(originalLicence))).toEqual({
      licenceConditionsAdded: [],
      licenceConditionsAmended: [],
      licenceConditionsRemoved: [],
      pssConditionsAdded: [],
      pssConditionsAmended: [],
      pssConditionsRemoved: [],
    })
  })
})
