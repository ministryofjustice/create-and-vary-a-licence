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
            expandedText: 'testCondition1',
            uploadSummary: [],
          },
          {
            code: '2',
            category: 'category2',
            expandedText: 'testCondition2',
            uploadSummary: [],
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
            expandedText: 'testCondition1',
            uploadSummary: [],
          },
          {
            code: '2',
            category: 'category2',
            expandedText: 'testCondition2',
            uploadSummary: [],
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
            expandedText: 'testCondition1',
            uploadSummary: [],
          },
        ],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalLicenceConditions: [
          {
            code: '1',
            category: 'category1',
            expandedText: 'amendedTestCondition1',
            uploadSummary: [],
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
            expandedText: 'testCondition1',
            uploadSummary: [],
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
            expandedText: 'testCondition1',
            uploadSummary: [],
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
            expandedText: 'testCondition1',
            uploadSummary: [],
          },
        ],
      } as Licence

      const variedLicence = {
        ...licenceTemplate,
        additionalPssConditions: [
          {
            code: '1',
            category: 'category1',
            expandedText: 'amendedTestCondition1',
            uploadSummary: [],
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
          expandedText: 'testCondition1',
          uploadSummary: [],
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

  it('should return changes to multiple exclusion zones', () => {
    const originalLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'testCondition1',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'Wales',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'England',
          uploadSummary: [],
        },
      ],
    } as Licence

    const variedLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'amendedTestCondition1',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'Wales',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'Scotland',
          uploadSummary: [],
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
        {
          category: 'Freedom of movement',
          condition: 'Wales\n\nScotland',
        },
      ],
      licenceConditionsRemoved: [],
      pssConditionsAdded: [],
      pssConditionsAmended: [],
      pssConditionsRemoved: [],
    })
  })

  it('should not return changes to multiple exclusion zones', () => {
    const originalLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'testCondition1',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'Wales',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'England',
          uploadSummary: [],
        },
      ],
    } as Licence

    const variedLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'amendedTestCondition1',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'Wales',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'England',
          uploadSummary: [],
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

  it('should return multiple exclusion zones have been removed', () => {
    const originalLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'testCondition1',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'Wales',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'England',
          uploadSummary: [],
        },
      ],
    } as Licence

    const variedLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'amendedTestCondition1',
          uploadSummary: [],
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
      licenceConditionsRemoved: [
        {
          category: 'Freedom of movement',
          condition: 'Wales\n\nEngland',
        },
      ],
      pssConditionsAdded: [],
      pssConditionsAmended: [],
      pssConditionsRemoved: [],
    })
  })

  it('should return added multiple exclusion zones when parent licence had none present', () => {
    const originalLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'testCondition1',
          uploadSummary: [],
        },
      ],
    } as Licence

    const variedLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'amendedTestCondition1',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'Wales',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'Freedom of movement',
          expandedText: 'England',
          uploadSummary: [],
        },
      ],
    } as Licence

    expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
      licenceConditionsAdded: [
        {
          category: 'Freedom of movement',
          condition: 'Wales\n\nEngland',
        },
      ],
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

  it('should not return list of removed additional and bespoke licence conditions if licence is in PSS period', () => {
    const originalLicence = {
      ...licenceTemplate,
      additionalLicenceConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'testCondition1',
          uploadSummary: [],
        },
        {
          code: '2',
          category: 'category2',
          expandedText: 'testCondition2',
          uploadSummary: [],
        },
      ],
      additionalPssConditions: [
        {
          code: '1',
          category: 'category1',
          expandedText: 'testCondition1',
          uploadSummary: [],
        },
      ],
      bespokeConditions: [{ text: 'bespoke1' }, { text: 'bespoke2' }],
    } as Licence

    const variedLicence = {
      ...licenceTemplate,
      isInPssPeriod: true,
      additionalLicenceConditions: [],
      bespokeConditions: [],
      additionalPssConditions: [],
    } as Licence

    expect(compareLicenceConditions(originalLicence, variedLicence)).toEqual({
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
})
