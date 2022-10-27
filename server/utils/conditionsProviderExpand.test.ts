import { AdditionalCondition, AdditionalConditionAp } from '../@types/licenceApiClientTypes'
import ConditionService from '../services/conditionService'

describe('Conditions Provider - expansions', () => {
  const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>

  const conditionsProviderSpy = jest.spyOn(conditionService, 'getAdditionalConditionByCode')

  describe('expandAdditionalConditions', () => {
    it('Will return text verbatim when no placeholders exist', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        sequence: 1,
        text: 'Not to own or use a camera without the prior approval of your supervising officer.',
        data: [],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        text: 'Not to own or use a camera without the prior approval of your supervising officer.',
        requiresInput: false,
        categoryShort: 'Items and documents',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual('Not to own or use a camera without the prior approval of your supervising officer.')
    })

    it('Will replace single placeholder with a single value', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        sequence: 0,
        text: 'You must reside within the [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        data: [{ id: 1, field: 'probationRegion', value: 'London', sequence: 0 }],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        text: 'You must reside within the [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        tpl: 'You must reside within the {probationRegion} probation region while of no fixed abode, unless otherwise approved by your supervising officer.',
        requiresInput: true,
        inputs: [],
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'You must reside within the London probation region while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will remove optional placeholders that are not matched by data', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        sequence: 0,
        text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        data: [{ id: 1, field: 'wrongName', value: 'London', sequence: 0 }],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        text: 'You must reside within the [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        tpl: 'You must reside within the {probationRegion} probation region while of no fixed abode, unless otherwise approved by your supervising officer.',
        requiresInput: true,
        inputs: [],
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      // The two consecutive spaces are expected here
      expect(result).toEqual(
        'You must reside within the  probation region while of no fixed abode, unless otherwise approved by your supervising officer.'
      )
    })

    it('Will replace placeholders of type number', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
        data: [{ id: 1, field: 'age', value: '18', sequence: 0 }],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
        tpl: 'Not to undertake work or other organised activity which will involve a person under the age of {age}, either on a paid or unpaid basis without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [],
        categoryShort: 'Programmes or activities',
        type: 'WorkingWithChildren',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Not to undertake work or other organised activity which will involve a person under the age of 18, either on a paid or unpaid basis without the prior approval of your supervising officer.'
      )
    })

    it('Will replace multiple placeholders and adjust case to lower', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
        category: 'Restriction of residency',
        sequence: 1,
        text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
        data: [
          { id: 1, field: 'gender', value: 'Any', sequence: 0 },
          { id: 2, field: 'age', value: '18', sequence: 1 },
        ],
        uploadSummary: [],
      }

      const conditionConfig: AdditionalConditionAp = {
        code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
        category: 'Restriction of residency',
        text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
        tpl: 'Not to reside (not even to stay for one night) in the same household as {gender} child under the age of {age} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'radio',
            label: 'Select the relevant text',
            name: 'gender',
            case: 'lower',
          },
        ],
        categoryShort: null,
        type: 'RestrictionOfResidency',
      }
      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Not to reside (not even to stay for one night) in the same household as any child under the age of 18 without the prior approval of your supervising officer.'
      )
    })

    it('Will replace placeholders for a list with and "and" between them and include optional text for optional values', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
        data: [
          { id: 1, field: 'behaviourProblems', value: 'alcohol', sequence: 0 },
          { id: 2, field: 'behaviourProblems', value: 'drug', sequence: 1 },
          { id: 3, field: 'course', value: 'Walthamstow Rehabilitation Clinic', sequence: 2 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].',
        tpl: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your {behaviourProblems} problems{course}.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'behaviourProblems',
            listType: 'AND',
          },
          {
            type: 'text',
            label: 'Enter name of course or centre (optional)',
            name: 'course',
            includeBefore: ' at the ',
          },
        ],
        categoryShort: 'Programmes or activities',
        type: 'BehaviourProblems',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol and drug problems at the Walthamstow Rehabilitation Clinic.'
      )
    })

    it('Will omit optional text from the sentence when an optional value is not supplied', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
        data: [
          { id: 1, field: 'behaviourProblems', value: 'alcohol', sequence: 0 },
          { id: 2, field: 'behaviourProblems', value: 'drug', sequence: 1 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].',
        tpl: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your {behaviourProblems} problems{course}.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'behaviourProblems',
            listType: 'AND',
          },
          {
            type: 'text',
            label: 'Enter name of course or centre (optional)',
            name: 'course',
            includeBefore: ' at the ',
          },
        ],
        categoryShort: 'Programmes or activities',
        type: 'BehaviourProblems',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol and drug problems.'
      )
    })

    it('Will make sense with multiple optional values - none supplied', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [
          { id: 1, field: 'appointmentAddress', value: 'Harlow Clinic, High Street, London, W1 3GV', sequence: 0 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        tpl: 'Attend {appointmentAddress}{appointmentDate}{appointmentTime}, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        requiresInput: true,
        inputs: [
          {
            type: 'timePicker',
            label: 'Enter time (optional)',
            name: 'appointmentTime',
            includeBefore: ' at ',
          },
          {
            type: 'datePicker',
            label: 'Enter date (optional)',
            name: 'appointmentDate',
            includeBefore: ' on ',
          },
          {
            type: 'address',
            label: 'Enter the address for the appointment',
            name: 'appointmentAddress',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'AppointmentTimeAndPlace',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will make sense with multiple optional values - one supplied', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [
          { id: 1, field: 'appointmentAddress', value: 'Harlow Clinic, High Street, London, W1 3GV', sequence: 0 },
          { id: 2, field: 'appointmentDate', value: '12th February 2022', sequence: 1 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        tpl: 'Attend {appointmentAddress}{appointmentDate}{appointmentTime}, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        requiresInput: true,
        inputs: [
          {
            type: 'timePicker',
            label: 'Enter time (optional)',
            name: 'appointmentTime',
            includeBefore: ' at ',
          },
          {
            type: 'datePicker',
            label: 'Enter date (optional)',
            name: 'appointmentDate',
            includeBefore: ' on ',
          },
          {
            type: 'address',
            label: 'Enter the address for the appointment',
            name: 'appointmentAddress',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'AppointmentTimeAndPlace',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV on 12th February 2022, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will make sense with multiple optional values - two supplied', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [
          { id: 1, field: 'appointmentAddress', value: 'Harlow Clinic, High Street, London, W1 3GV', sequence: 0 },
          { id: 2, field: 'appointmentDate', value: '12th February 2022', sequence: 1 },
          { id: 3, field: 'appointmentTime', value: '11:15 am', sequence: 2 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        tpl: 'Attend {appointmentAddress}{appointmentDate}{appointmentTime}, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        requiresInput: true,
        inputs: [
          {
            type: 'timePicker',
            label: 'Enter time (optional)',
            name: 'appointmentTime',
            includeBefore: ' at ',
          },
          {
            type: 'datePicker',
            label: 'Enter date (optional)',
            name: 'appointmentDate',
            includeBefore: ' on ',
          },
          {
            type: 'address',
            label: 'Enter the address for the appointment',
            name: 'appointmentAddress',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'AppointmentTimeAndPlace',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Attend Harlow Clinic, High Street, London, W1 3GV on 12th February 2022 at 11:15 am, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will replace placeholders for a list of values with commas and "and" between (list type AND)', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        sequence: 1,
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [ALCOHOL / DRUG / SEXUAL / VIOLENT / GAMBLING / SOLVENT ABUSE / ANGER / DEBT / PROLIFIC / OFFENDING BEHAVIOUR] problems.',
        data: [
          { id: 1, field: 'behaviourProblems', value: 'alcohol', sequence: 0 },
          { id: 2, field: 'behaviourProblems', value: 'drug', sequence: 1 },
          { id: 3, field: 'behaviourProblems', value: 'sexual', sequence: 2 },
          { id: 4, field: 'behaviourProblems', value: 'violent', sequence: 3 },
          { id: 5, field: 'behaviourProblems', value: 'gambling', sequence: 4 },
          { id: 6, field: 'behaviourProblems', value: 'anger', sequence: 5 },
          { id: 7, field: 'course', value: 'AA meeting', sequence: 6 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].',
        tpl: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your {behaviourProblems} problems{course}.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'behaviourProblems',
            listType: 'AND',
          },
          {
            type: 'text',
            label: 'Enter name of course or centre (optional)',
            name: 'course',
            includeBefore: ' at the ',
          },
        ],
        categoryShort: 'Programmes or activities',
        type: 'BehaviourProblems',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol, drug, sexual, violent, gambling and anger problems at the AA meeting.'
      )
    })

    it('Will replace placeholders for a list of 2 values with an "OR" between them (list type OR)', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        data: [
          { id: 1, field: 'name', value: 'Jane Doe', sequence: 0 },
          { id: 2, field: 'name', value: 'John Doe', sequence: 1 },
          { id: 3, field: 'socialServicesDepartment', value: 'East Hull Social Services', sequence: 2 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
        category: 'Making or maintaining contact with a person',
        text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        tpl: 'Not to seek to approach or communicate with {name} without the prior approval of your supervising officer{socialServicesDepartment}.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name of victim or family member',
            name: 'name',
            listType: 'OR',
            case: 'capitalise',
          },
          {
            type: 'text',
            label: 'Enter social services department (optional)',
            name: 'socialServicesDepartment',
            case: 'capitalise',
            includeBefore: ' and / or ',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'NoContactWithVictim',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Not to seek to approach or communicate with Jane Doe or John Doe without the prior approval of your supervising officer and / or East Hull Social Services.'
      )
    })

    it('Will replace placeholders for a list of values with commas and an "OR" between them (list type OR)', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
        category: 'Making or maintaining contact with a person',
        sequence: 1,
        text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        data: [
          { id: 1, field: 'name', value: 'Jane Doe', sequence: 0 },
          { id: 2, field: 'name', value: 'John Doe', sequence: 1 },
          { id: 3, field: 'name', value: 'Jack Dont', sequence: 2 },
          { id: 4, field: 'socialServicesDepartment', value: 'East Hull Social Services', sequence: 3 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
        category: 'Making or maintaining contact with a person',
        text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        tpl: 'Not to seek to approach or communicate with {name} without the prior approval of your supervising officer{socialServicesDepartment}.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name of victim or family member',
            name: 'name',
            listType: 'OR',
            case: 'capitalise',
          },
          {
            type: 'text',
            label: 'Enter social services department (optional)',
            name: 'socialServicesDepartment',
            case: 'capitalise',
            includeBefore: ' and / or ',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'NoContactWithVictim',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Not to seek to approach or communicate with Jane Doe, John Doe or Jack Dont without the prior approval of your supervising officer and / or East Hull Social Services.'
      )
    })

    it('Will correctly format an address', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Residence at a specific place',
        sequence: 1,
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        data: [{ id: 1, field: 'appointmentAddress', value: '123 Fake Street, , Fakestown, , LN123TO', sequence: 0 }],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        tpl: 'Attend {appointmentAddress}{appointmentDate}{appointmentTime}, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        requiresInput: true,
        inputs: [
          {
            type: 'timePicker',
            label: 'Enter time (optional)',
            name: 'appointmentTime',
            includeBefore: ' at ',
          },
          {
            type: 'datePicker',
            label: 'Enter date (optional)',
            name: 'appointmentDate',
            includeBefore: ' on ',
          },
          {
            type: 'address',
            label: 'Enter the address for the appointment',
            name: 'appointmentAddress',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'AppointmentTimeAndPlace',
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Attend 123 Fake Street, Fakestown, LN123TO, as directed, to address your dependency on, or propensity to misuse, a controlled drug.'
      )
    })

    it('Will replace placeholders for conditional reveal inputs', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        sequence: 1,
        text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        data: [
          { id: 1, field: 'approvedPremises', value: 'the police station', sequence: 0 },
          { id: 2, field: 'reportingTime', value: '2pm', sequence: 1 },
          { id: 3, field: 'reviewPeriod', value: 'Other', sequence: 2 },
          { id: 4, field: 'alternativeReviewPeriod', value: 'Fortnightly', sequence: 3 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        tpl: 'Report to staff at {approvedPremises} at {reportingTime}, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name of approved premises',
            name: 'approvedPremises',
            case: 'capitalised',
          },
          {
            type: 'timePicker',
            label: 'Enter a reporting time',
            name: 'reportingTime',
          },
          {
            type: 'radio',
            label: 'Select a review period',
            name: 'reviewPeriod',
            options: [
              {
                value: 'Other',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Enter a review period',
                      name: 'alternativeReviewPeriod',
                      case: 'lower',
                      handleIndefiniteArticle: true,
                    },
                  ],
                },
              },
            ],
            case: 'lower',
            handleIndefiniteArticle: true,
          },
        ],
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Report to staff at The Police Station at 2pm, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a fortnightly basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.'
      )
    })

    it('Will replace adjust wording where values start with vowel', async () => {
      const condition: AdditionalCondition = {
        id: 1,
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        sequence: 1,
        text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        data: [
          { id: 1, field: 'approvedPremises', value: 'the police station', sequence: 0 },
          { id: 2, field: 'reportingTime', value: '2pm', sequence: 1 },
          { id: 3, field: 'reviewPeriod', value: 'Other', sequence: 2 },
          { id: 4, field: 'alternativeReviewPeriod', value: 'ongoing', sequence: 3 },
        ],
        uploadSummary: [],
      }
      const conditionConfig: AdditionalConditionAp = {
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        tpl: 'Report to staff at {approvedPremises} at {reportingTime}, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name of approved premises',
            name: 'approvedPremises',
            case: 'capitalised',
          },
          {
            type: 'timePicker',
            label: 'Enter a reporting time',
            name: 'reportingTime',
          },
          {
            type: 'radio',
            label: 'Select a review period',
            name: 'reviewPeriod',
            options: [
              {
                value: 'Other',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Enter a review period',
                      name: 'alternativeReviewPeriod',
                      case: 'lower',
                      handleIndefiniteArticle: true,
                    },
                  ],
                },
              },
            ],
            case: 'lower',
            handleIndefiniteArticle: true,
          },
        ],
      }

      conditionsProviderSpy.mockResolvedValue(conditionConfig)

      const result = await conditionService.expandAdditionalCondition(condition.code, condition.data, 'version')
      expect(result).toEqual(
        'Report to staff at The Police Station at 2pm, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on an ongoing basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.'
      )
    })
  })
})
