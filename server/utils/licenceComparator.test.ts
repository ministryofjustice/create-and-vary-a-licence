import _ from 'lodash'
import { compareLicenceConditions, hasUpdatedCurfewAddress, hasUpdatedCurfewHours } from './licenceComparator'
import { CurfewTimes, HdcCurfewAddress, Licence } from '../@types/licenceApiClientTypes'

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

  describe('hasUpdatedCurfewAddress', () => {
    it('should return true if the first line of the curfew address has changed', () => {
      const originalAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      const variedAddress = {
        firstLine: 'Fake Flat',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      expect(hasUpdatedCurfewAddress(originalAddress, variedAddress)).toBe(true)
    })

    it('should be true if the second line of the curfew address has changed', () => {
      const originalAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      const variedAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Avenue',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      expect(hasUpdatedCurfewAddress(originalAddress, variedAddress)).toBe(true)
    })

    it('should be true if the town or city of the curfew address has changed', () => {
      const originalAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      const variedAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Fakeshire',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      expect(hasUpdatedCurfewAddress(originalAddress, variedAddress)).toBe(true)
    })

    it('should be true if the county of the curfew address has changed', () => {
      const originalAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      const variedAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fakeshire',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      expect(hasUpdatedCurfewAddress(originalAddress, variedAddress)).toBe(true)
    })

    it('should be true if the postcode of the curfew address has changed', () => {
      const originalAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      const variedAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 2KE',
      } as HdcCurfewAddress

      expect(hasUpdatedCurfewAddress(originalAddress, variedAddress)).toBe(true)
    })

    it('should be false if the curfew address has not changed', () => {
      const originalAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      const variedAddress = {
        firstLine: 'Fake House',
        secondLine: 'Fake Street',
        townOrCity: 'Faketown',
        county: 'Fake County',
        postcode: 'FA1 1KE',
      } as HdcCurfewAddress

      expect(hasUpdatedCurfewAddress(originalAddress, variedAddress)).toBe(false)
    })
  })

  describe('hasUpdatedCurfewHours', () => {
    it('should return true if the fromTime of one of the curfews has changed', () => {
      const originalCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      const variedCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '06:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      expect(hasUpdatedCurfewHours(originalCurfewHours, variedCurfewHours)).toBe(true)
    })

    it('should return true if the untilTime of one of the curfews has changed', () => {
      const originalCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      const variedCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '08:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      expect(hasUpdatedCurfewHours(originalCurfewHours, variedCurfewHours)).toBe(true)
    })

    it('should return true if the fromDay of one of the curfews has changed', () => {
      const originalCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      const variedCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'TUESDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      expect(hasUpdatedCurfewHours(originalCurfewHours, variedCurfewHours)).toBe(true)
    })

    it('should return true if the untilDay of one of the curfews has changed', () => {
      const originalCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      const variedCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'MONDAY',
          untilDay: 'WEDNESDAY',
        },
      ] as CurfewTimes[]

      expect(hasUpdatedCurfewHours(originalCurfewHours, variedCurfewHours)).toBe(true)
    })

    it('should return false if the curfew hours have not changed', () => {
      const originalCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      const variedCurfewHours = [
        {
          curfewTimesSequence: 1,
          fromTime: '19:00',
          untilTime: '07:00',
          fromDay: 'MONDAY',
          untilDay: 'TUESDAY',
        },
      ] as CurfewTimes[]

      expect(hasUpdatedCurfewHours(originalCurfewHours, variedCurfewHours)).toBe(false)
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
