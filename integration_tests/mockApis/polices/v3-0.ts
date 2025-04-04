import { LicencePolicyResponse } from '../../../server/@types/licenceApiClientTypes'

const policy: LicencePolicyResponse = {
  version: '3.0',
  standardConditions: {
    AP: [
      {
        code: '9ce9d594-e346-4785-9642-c87e764bee37',
        text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period.',
      },
      {
        code: '3b19fdb0-4ca3-4615-9fdd-61fabc1587af',
        text: 'Not commit any offence.',
      },
      {
        code: '3361683a-504a-4357-ae22-6aa01b370b4a',
        text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer.',
      },
      {
        code: '9fc04065-df29-4bda-9b1d-bced8335c356',
        text: 'Receive visits from the supervising officer in accordance with any instructions given by the supervising officer.',
      },
      {
        code: 'e670ac69-eda2-4b04-a0a1-a3c8492fe1e6',
        text: 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address.',
      },
      {
        code: '78A5F860-4791-48F2-B707-D6D4413850EE',
        text: 'Tell the supervising officer if you use a name which is different to the name or names which appear on your licence.',
      },
      {
        code: '6FA6E492-F0AB-4E76-B868-63813DB44696',
        text: 'Tell the supervising officer if you change or add any contact details, including phone number or email.',
      },
      {
        code: '88069445-08cb-4f16-915f-5a162d085c26',
        text: 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work.',
      },
      {
        code: '7d416906-0e94-4fde-ae86-8339d339ccb7',
        text: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of the supervising officer or for the purposes of immigration deportation or removal.',
      },
    ],
    PSS: [
      {
        code: 'b3cd4a30-11fd-4715-9ebb-ed89f5386e1f',
        text: 'Be of good behaviour and not behave in a way that undermines the rehabilitative purpose of the supervision period.',
      },
      {
        code: 'b950407d-2270-45b8-9666-3ad58a17d0be',
        text: 'Not commit any offence.',
      },
      {
        code: '93413832-9954-4907-a64d-eb8a56e34afb',
        text: 'Keep in touch with your supervisor in accordance with instructions given by your supervisor.',
      },
      {
        code: '9288e01c-e40e-4040-8b6e-57092361f422',
        text: 'Receive visits from your supervisor in accordance with instructions given by your supervisor.',
      },
      {
        code: '8e15cf42-f8e0-4408-a33e-d16a3448b7bd',
        text: 'Reside permanently at an address approved by your supervisor and obtain the prior permission of the supervisor for any stay of one or more nights at a different address.',
      },
      {
        code: '0ed57797-2745-4592-a78b-8e4d712c580e',
        text: 'Not undertake work, or a particular type of work, unless it is approved by your supervisor and notify your supervisor in advance of any proposal to undertake work or a particular type of work.',
      },
      {
        code: 'c8966621-088a-4b87-9a19-752ff8b900c6',
        text: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervisor or in order to comply with a legal obligation (whether or not arising under the law of any part of the United Kingdom, the Channel Islands or the Isle of Man).',
      },
      {
        code: '579060fd-e412-471c-94d7-2fefa06d5052',
        text: 'Participate in activities in accordance with any instructions given by your supervisor.',
      },
    ],
  },
  additionalConditions: {
    AP: [
      {
        code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
        category: 'Residence at a specific place',
        text: 'You must reside overnight within [REGION] probation region while of no fixed abode, unless otherwise approved by your supervising officer.',
        tpl: 'You must reside overnight within {probationRegion} probation region while of no fixed abode, unless otherwise approved by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'radio',
            label: 'Select the probation region',
            name: 'probationRegion',
            options: [
              {
                value: 'North East',
              },
              {
                value: 'North West',
              },
              {
                value: 'Greater Manchester',
              },
              {
                value: 'Yorkshire and Humberside',
              },
              {
                value: 'East Midlands',
              },
              {
                value: 'West Midlands',
              },
              {
                value: 'East of England',
              },
              {
                value: 'South West',
              },
              {
                value: 'South Central',
              },
              {
                value: 'London',
              },
              {
                value: 'Kent, Surrey and Sussex',
              },
              {
                value: 'Wales',
              },
            ],
          },
        ],
        type: 'RegionOfResidence',
        skippable: false,
      },
      {
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
            options: [
              {
                value: 'any',
              },
              {
                value: 'any female',
              },
              {
                value: 'any male',
              },
            ],
            case: 'lower',
          },
          {
            type: 'text',
            label: 'Enter the relevant age',
            name: 'age',
          },
        ],
        type: 'RestrictionOfResidencyPolicyV3',
        skippable: false,
      },
      {
        code: 'b72fdbf2-0dc9-4e7f-81e4-c2ccb5d1bc90',
        category: 'Making or maintaining contact with a person',
        text: 'Attend all appointments arranged for you with a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER] unless otherwise approved by your supervising officer.',
        tpl: 'Attend all appointments arranged for you with a {appointmentType} unless otherwise approved by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all the relevant options',
            name: 'appointmentType',
            listType: 'AND',
            options: [
              {
                value: 'Psychiatrist',
              },
              {
                value: 'Psychologist',
              },
              {
                value: 'Medical practitioner',
              },
            ],
            case: 'lower',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'MedicalAppointmentType',
        skippable: false,
      },
      {
        code: '9ae2a336-3491-4667-aaed-dd852b09b4b9',
        category: 'Making or maintaining contact with a person',
        text: 'Receive home visits from a Mental Health Worker.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
        code: '75a6aac6-02a7-4414-af14-942be6736892',
        category: 'Making or maintaining contact with a person',
        text: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to your supervising officer.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
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
            case: 'capitalised',
            addAnother: {
              label: 'Add another person',
            },
          },
          {
            type: 'text',
            label: 'Enter social services department (optional)',
            name: 'socialServicesDepartment',
            case: 'capitalised',
            includeBefore: ' and / or ',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'NoContactWithVictim',
        skippable: false,
      },
      {
        code: '4a5fed48-0fb9-4711-8ddf-b46ddfd90246',
        category: 'Making or maintaining contact with a person',
        text: 'Not to have unsupervised contact with [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
        tpl: 'Not to have unsupervised contact with {gender} children under the age of {age} without the prior approval of your supervising officer{socialServicesDepartment} except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
        requiresInput: true,
        inputs: [
          {
            type: 'radio',
            label: 'Select the relevant gender',
            name: 'gender',
            options: [
              {
                value: 'any',
              },
              {
                value: 'any female',
              },
              {
                value: 'any male',
              },
            ],
            case: 'lower',
          },
          {
            type: 'text',
            label: 'Select the relevant age',
            name: 'age',
          },
          {
            type: 'text',
            label: 'Enter social services department (optional)',
            name: 'socialServicesDepartment',
            case: 'capitalised',
            includeBefore: ' and / or ',
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'UnsupervisedContactPolicyV3',
        skippable: false,
      },
      {
        code: '355700a9-6184-40c0-9759-0dfed1994e1e',
        category: 'Making or maintaining contact with a person',
        text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
        tpl: 'Not to contact or associate with {nameOfIndividual} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name of offender or individual',
            name: 'nameOfIndividual',
            listType: 'OR',
            case: 'capitalised',
            addAnother: {
              label: 'Add another person',
            },
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'NamedIndividuals',
        skippable: false,
      },
      {
        code: '0aa669bf-db8a-4b8e-b8ba-ca82fc245b94',
        category: 'Making or maintaining contact with a person',
        text: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
        code: 'cc80d02b-0b62-4940-bac6-0bcd374c725e',
        category: 'Making or maintaining contact with a person',
        text: 'Not to contact directly or indirectly any person who is a serving or remand prisoner or detained in State custody, without the prior approval of your supervising officer.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
        code: '18b69f61-800f-46b2-95c4-2019d33e34d6',
        category: 'Making or maintaining contact with a person',
        text: 'Not to associate with any person currently or formerly associated with [NAMES OF SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
        tpl: 'Not to associate with any person currently or formerly associated with {nameOfOrganisation} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter the name of group or organisation',
            name: 'nameOfOrganisation',
            listType: 'OR',
            addAnother: {
              label: 'Add another group or organisation',
            },
          },
        ],
        categoryShort: 'Contact with a person',
        type: 'NamedOrganisation',
        skippable: false,
      },
      {
        code: '48c4ae87-b8d8-45d1-aded-daefe8ad07fe',
        category: 'Making or maintaining contact with a person',
        text: 'Not to engage with or attempt to engage with commercial sexual services. This includes companionship/friendship style services, and all services whether sexual or not.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
        code: 'd5998ca1-62a2-4409-88cd-3137d893c2a0',
        category: 'Making or maintaining contact with a person',
        text: 'Not to approach or communicate with any victims of your offences without the prior approval of your supervising officer.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
        code: '86e7a2cb-33b5-4079-84a4-f6579347c890',
        category: 'Making or maintaining contact with a person',
        text: 'Not to approach, contact or undertake any type of relationship with any employee, contractor or volunteer working on behalf of HM Prison and Probation Service directly or indirectly outside of supervision in appointments/reporting requirements without the prior permission of your supervising officer.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
        code: '1905aa46-59dd-4eb7-b009-81467cc8c426',
        category: 'Making or maintaining contact with a person',
        text: 'Not to attempt to bribe, blackmail or coerce any employee, contractor or volunteer working on behalf of HM Prison and Probation Service directly or indirectly to undertake actions on your behalf.',
        requiresInput: false,
        categoryShort: 'Contact with a person',
        skippable: false,
      },
      {
        code: 'df3f08a8-4ae0-41fe-b3bc-d0be1fd2d8aa',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your [SEXUAL OFFENDING / VIOLENT OFFENDING / GAMBLING / PROLIFIC OFFENDING / OFFENDING BEHAVIOUR].',
        tpl: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your {behaviourProblems}.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'behaviourProblems',
            listType: 'AND',
            options: [
              {
                value: 'sexual offending',
              },
              {
                value: 'violent offending',
              },
              {
                value: 'gambling',
              },
              {
                value: 'prolific offending',
              },
              {
                value: 'offending behaviour',
              },
            ],
          },
        ],
        categoryShort: 'Programmes or activities',
        type: 'BehaviourProblems',
        skippable: false,
      },
      {
        code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
        tpl: 'Not to undertake work or other organised activity which will involve a person under the age of {age}, either on a paid or unpaid basis without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Select the relevant age',
            name: 'age',
          },
        ],
        categoryShort: 'Programmes or activities',
        type: 'WorkingWithChildrenPolicyV3',
        skippable: false,
      },
      {
        code: '0EDB6D01-46B6-408F-971C-0EBFF5FA93F0',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'To engage with the Integrated Offender Management Team, and follow their instructions.',
        requiresInput: false,
        categoryShort: 'Programmes or activities',
        skippable: false,
      },
      {
        code: '625feb82-a5ab-4490-82e9-241218f775c5',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: "To comply with any requirements specified by your supervising officer to register and engage with [HOUSING / BENEFITS / EARLY HELP / CHILDREN'S SERVICES / YOUR SUPPORT NETWORKS / AN EDUCATION PROVIDER].",
        tpl: 'To comply with any requirements specified by your supervising officer to register and engage with {services}.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'services',
            listType: 'AND',
            options: [
              {
                value: 'housing',
              },
              {
                value: 'benefits',
              },
              {
                value: 'early help',
              },
              {
                value: "children's services",
              },
              {
                value: 'your support networks',
              },
              {
                value: 'an education provider',
              },
            ],
          },
        ],
        categoryShort: 'Programmes or activities',
        type: 'RegisterForServices',
        skippable: false,
      },
      {
        code: 'b149bc47-b279-427b-9ddc-c472fdc74ba5',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        text: 'To attend and engage with any appointments with staff at Job Centre Plus, unless otherwise approved by your supervising officer.',
        requiresInput: false,
        categoryShort: 'Programmes or activities',
        skippable: false,
      },
      {
        code: '8e52e16e-1abf-4251-baca-2fabfcb243d0',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        text: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone or one you have regular use of, including the IMEI number and the SIM card that you possess.',
        requiresInput: false,
        categoryShort: 'Items and documents',
        skippable: false,
      },
      {
        code: '5fa04bbf-6b7c-4b65-9388-a0115cd365a6',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        text: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
        requiresInput: false,
        categoryShort: 'Items and documents',
        skippable: false,
      },
      {
        code: 'bfbc693c-ab65-4042-920e-ddb085bc7aba',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        text: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a specific location, as specified by that officer.',
        requiresInput: false,
        categoryShort: 'Items and documents',
        skippable: false,
      },
      {
        code: '2d67f68a-8adf-47a9-a68d-a6fc9f2c4556',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        text: 'Not to delete the usage history on any [INTERNET ENABLED DEVICE / COMPUTER / MOBILE PHONE / DIGITAL CAMERAS] used and to allow such items to be inspected as requested. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
        tpl: 'Not to delete the usage history on any {deviceTypes} used and to allow such items to be inspected as requested. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'deviceTypes',
            listType: 'OR',
            options: [
              {
                value: 'internet enabled device',
              },
              {
                value: 'computer',
              },
              {
                value: 'mobile phone',
              },
              {
                value: 'digital cameras',
              },
            ],
          },
        ],
        categoryShort: 'Items and documents',
        type: 'UsageHistory',
        skippable: false,
      },
      {
        code: '3932e5c9-4d21-4251-a747-ce6dc52dc9c0',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        text: 'Not to own or possess a [SPECIFIED ITEM] without the prior approval of your supervising officer.',
        tpl: 'Not to own or possess {item} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter the name of the item',
            name: 'item',
            listType: 'OR',
            handleIndefiniteArticle: true,
            addAnother: {
              label: 'Add another item',
            },
          },
        ],
        categoryShort: 'Items and documents',
        type: 'SpecifiedItem',
        skippable: false,
      },
      {
        code: '2a93b784-b8cb-49ed-95e2-a0df60723cda',
        category: 'Disclosure of information',
        text: 'Provide your supervising officer with details (such as make, model, colour, registration) of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: 'db2d7e24-b130-4c7e-a1bf-6bb5f3036c02',
        category: 'Disclosure of information',
        text: 'Notify your supervising officer of any developing relationships, including status changes such as engagement, marriage, pregnancies or the ending of any relationships, and disclose the details of the person you are in a relationship with.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: 'c5e91330-748d-46f3-93f6-bbe5ea8324ce',
        category: 'Disclosure of information',
        text: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '79ac033f-9d7a-4dab-8344-475106e58b71',
        category: 'Disclosure of information',
        text: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '8686a815-b7f0-43b6-9886-f01df6a48773',
        category: 'Disclosure of information',
        text: 'Provide your supervising officer with the details of any [BANK ACCOUNTS / CREDIT CARDS / CRYPTO CURRENCY ACCOUNTS OR WALLETS] to which you have access or control over, including those held by a third party. You must also notify your supervising officer when you have access or control over any new accounts/wallets, and provide the details.',
        tpl: 'Provide your supervising officer with the details of any {accountTypes} to which you have access or control over, including those held by a third party. You must also notify your supervising officer when you have access or control over any new accounts/wallets, and provide the details.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'accountTypes',
            listType: 'AND',
            options: [
              {
                value: 'bank accounts',
              },
              {
                value: 'credit cards',
              },
              {
                value: 'crypto currency accounts or wallets',
              },
            ],
          },
        ],
        type: 'BankAccountDetails',
        skippable: false,
      },
      {
        code: '0a370862-5426-49c1-b6d4-3d074d78a81a',
        category: 'Curfew arrangement',
        text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
        tpl: 'Confine yourself to an address approved by your supervising officer between the hours of {curfewStart} and {curfewEnd} daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
        requiresInput: true,
        inputs: [
          {
            type: 'radio',
            label: 'Select the number of curfews needed',
            name: 'numberOfCurfews',
            options: [
              {
                value: 'One curfew',
                conditional: {
                  inputs: [
                    {
                      type: 'timePicker',
                      label: 'Enter the curfew start time',
                      name: 'curfewStart',
                    },
                    {
                      type: 'timePicker',
                      label: 'Enter the curfew end time',
                      name: 'curfewEnd',
                    },
                  ],
                },
              },
              {
                value: 'Two curfews',
                conditional: {
                  inputs: [
                    {
                      type: 'timePicker',
                      label: 'First curfew – enter the start time',
                      name: 'curfewStart',
                    },
                    {
                      type: 'timePicker',
                      label: 'First curfew – enter the end time',
                      name: 'curfewEnd',
                    },
                    {
                      type: 'timePicker',
                      label: 'Second curfew – enter the start time',
                      name: 'curfewStart2',
                    },
                    {
                      type: 'timePicker',
                      label: 'Second curfew – enter the end time',
                      name: 'curfewEnd2',
                    },
                  ],
                },
              },
              {
                value: 'Three curfews',
                conditional: {
                  inputs: [
                    {
                      type: 'timePicker',
                      label: 'First curfew – enter the start time',
                      name: 'curfewStart',
                    },
                    {
                      type: 'timePicker',
                      label: 'First curfew – enter the end time',
                      name: 'curfewEnd',
                    },
                    {
                      type: 'timePicker',
                      label: 'Second curfew – enter the start time',
                      name: 'curfewStart2',
                    },
                    {
                      type: 'timePicker',
                      label: 'Second curfew – enter the end time',
                      name: 'curfewEnd2',
                    },
                    {
                      type: 'timePicker',
                      label: 'Third curfew – enter the start time',
                      name: 'curfewStart3',
                    },
                    {
                      type: 'timePicker',
                      label: 'Third curfew – enter the end time',
                      name: 'curfewEnd3',
                    },
                  ],
                },
              },
            ],
          },
          {
            type: 'radio',
            label: 'Select a review period',
            name: 'reviewPeriod',
            options: [
              {
                value: 'Weekly',
              },
              {
                value: 'Monthly',
              },
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
        type: 'CurfewTerms',
        skippable: false,
      },
      {
        code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
        category: 'Freedom of movement',
        text: 'Not to enter the area as defined by the attached map without the prior approval of your supervising officer.',
        tpl: 'Not to enter the area as defined by the attached map without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'fileUpload',
            label: 'Select a PDF map of the area this person must not enter',
            name: 'outOfBoundFilename',
          },
        ],
        type: 'OutOfBoundsRegionPolicyV3',
        skippable: false,
      },
      {
        code: '42f71b40-84cd-446d-8647-f00bbb6c079c',
        category: 'Freedom of movement',
        text: 'Not to enter [NAME / TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
        tpl: 'Not to enter {nameOfPremises} {premisesAddress} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'radio',
            label: 'Choose what information to enter',
            name: 'nameTypeAndOrAddress',
            options: [
              {
                value: 'Just a name or type of premises',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Name or type of premises',
                      name: 'nameOfPremises',
                    },
                  ],
                },
              },
              {
                value: 'Just an address',
                conditional: {
                  inputs: [
                    {
                      type: 'address',
                      label: 'Enter the address of the premises',
                      name: 'premisesAddress',
                    },
                  ],
                },
              },
              {
                value: 'A name or type of premises and an address',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Name or type of premises',
                      name: 'nameOfPremises',
                    },
                    {
                      type: 'address',
                      label: 'Enter the address of the premises',
                      name: 'premisesAddress',
                    },
                  ],
                },
              },
            ],
          },
        ],
        type: 'OutOfBoundsPremises',
        skippable: false,
      },
      {
        code: 'c4a17002-88a3-43b4-b3f7-82ff476cb217',
        category: 'Freedom of movement',
        text: "Not to enter or remain in sight of any [CHILDREN'S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.",
        tpl: 'Not to enter or remain in sight of any {typeOfPremises} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter area or type of premises',
            name: 'typeOfPremises',
            case: 'lower',
          },
        ],
        type: 'OutOfBoundsPremisesType',
        skippable: false,
      },
      {
        code: '5d0416a9-a4ce-4b2c-8636-0b7abaa3680a',
        category: 'Freedom of movement',
        text: 'To only attend places of worship which have been previously agreed with your supervising officer.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '99195049-f355-46fb-b7d8-aef87a1b19c5',
        category: 'Freedom of movement',
        text: 'Not to enter the area as defined by the attached map, during the period that [NAME OF EVENT] takes place, including all occasions that the event takes place, without the prior permission of your supervising officer.',
        tpl: 'Not to enter the area as defined by the attached map, during the period that {eventName} takes place, including all occasions that the event takes place, without the prior permission of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter the name of the event',
            name: 'eventName',
          },
          {
            type: 'fileUpload',
            label: 'Select a PDF map of the area this person must not enter',
            name: 'outOfBoundFilename',
          },
        ],
        type: 'OutOfBoundsEvent',
        skippable: false,
      },
      {
        code: '1e9a66c6-f083-4c29-b209-b625252afbe5',
        category: 'Freedom of movement',
        text: 'Notify your supervising officer of any travel outside of your home county, including on public transport, prior to any such journey taking place unless otherwise specified by your supervising officer.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        text: 'Report to staff at [THE APPROVED PREMISES WHERE YOU RESIDE / NAME OF APPROVED PREMISES] at [TIME / DAILY / OTHER], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        tpl: 'Report to staff at {approvedPremises} at {reportingTime}{reportingTime1}{reportingTime2} {alternativeReportingFrequency || reportingFrequency}, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        requiresInput: true,
        inputs: [
          {
            type: 'radio',
            label: 'Choose what information to enter',
            name: 'addressOrGeneric',
            options: [
              {
                value: 'The approved premises where you reside',
              },
              {
                value: 'Name of approved premises',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Enter name of approved premises',
                      name: 'approvedPremises',
                    },
                  ],
                },
              },
            ],
          },
          {
            type: 'radio',
            label: 'Select when the person needs to report',
            name: 'reportingFrequency',
            options: [
              {
                value: 'Daily',
              },
              {
                value: 'Monday to Friday',
              },
              {
                value: 'Other',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Enter the other frequency',
                      name: 'alternativeReportingFrequency',
                    },
                  ],
                },
              },
            ],
          },
          {
            type: 'radio',
            label: 'Select how many times each day they need to report',
            name: 'numberOfReportingTimes',
            options: [
              {
                value: 'Once a day',
                conditional: {
                  inputs: [
                    {
                      type: 'timePicker',
                      label: 'Enter the reporting time',
                      name: 'reportingTime',
                    },
                  ],
                },
              },
              {
                value: 'Twice a day',
                conditional: {
                  inputs: [
                    {
                      type: 'timePicker',
                      label: 'Enter the first reporting time',
                      name: 'reportingTime1',
                    },
                    {
                      type: 'timePicker',
                      label: 'Enter the second reporting time',
                      name: 'reportingTime2',
                      includeBefore: ' and ',
                    },
                  ],
                },
              },
            ],
            subtext:
              'If you want to add more than 2 reporting times per day, this must be done as a bespoke condition approved by PPCS.',
          },
          {
            type: 'radio',
            label: 'Select a review period',
            name: 'reviewPeriod',
            options: [
              {
                value: 'Weekly',
              },
              {
                value: 'Monthly',
              },
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
        categoryShort: 'Supervision in the community',
        type: 'ReportToApprovedPremisesPolicyV3',
        skippable: false,
      },
      {
        code: '2027ae19-04a2-4fa6-8d1b-a62dffba2e62',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        text: 'Report to staff at [NAME OF POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        tpl: 'Report to staff at {policeStation} at {reportingTime}{reportingTime1}{reportingTime2} {alternativeReportingFrequency || reportingFrequency}, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name of police station',
            name: 'policeStation',
            case: 'capitalised',
          },
          {
            type: 'radio',
            label: 'Select when the person needs to report',
            name: 'reportingFrequency',
            options: [
              {
                value: 'Daily',
              },
              {
                value: 'Monday to Friday',
              },
              {
                value: 'Other',
                conditional: {
                  inputs: [
                    {
                      type: 'text',
                      label: 'Enter the other frequency',
                      name: 'alternativeReportingFrequency',
                    },
                  ],
                },
              },
            ],
          },
          {
            type: 'radio',
            label: 'Select how many times each day they need to report',
            name: 'numberOfReportingTimes',
            options: [
              {
                value: 'Once a day',
                conditional: {
                  inputs: [
                    {
                      type: 'timePicker',
                      label: 'Enter the reporting time',
                      name: 'reportingTime',
                    },
                  ],
                },
              },
              {
                value: 'Twice a day',
                conditional: {
                  inputs: [
                    {
                      type: 'timePicker',
                      label: 'Enter the first reporting time',
                      name: 'reportingTime1',
                    },
                    {
                      type: 'timePicker',
                      label: 'Enter the second reporting time',
                      name: 'reportingTime2',
                      includeBefore: ' and ',
                    },
                  ],
                },
              },
            ],
            subtext:
              'If you want to add more than 2 reporting times per day, this must be done as a bespoke condition approved by PPCS.',
          },
          {
            type: 'radio',
            label: 'Select a review period',
            name: 'reviewPeriod',
            options: [
              {
                value: 'Weekly',
              },
              {
                value: 'Monthly',
              },
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
        categoryShort: 'Supervision in the community',
        type: 'ReportToPoliceStation',
        skippable: false,
      },
      {
        code: '7a9ca3bb-922a-433a-9601-1e475c6c0095',
        category: 'Restriction of specified conduct or specified acts',
        text: 'Not to participate directly or indirectly in organising and/or contributing to any demonstration, meeting, gathering or website without the prior approval of your supervising officer. This condition will be reviewed on a monthly basis and may be amended or removed if your risk is assessed as having changed.',
        requiresInput: false,
        categoryShort: 'Restriction of conduct or acts',
        skippable: false,
      },
      {
        code: '985d339a-b652-40e3-b0a8-5aafd5e121f1',
        category: 'Restriction of specified conduct or specified acts',
        text: 'Not to partake in gambling, or making payments for other games of chance without the prior permission of your supervising officer.',
        requiresInput: false,
        categoryShort: 'Restriction of conduct or acts',
        skippable: false,
      },
      {
        code: '3b6b7c4f-6c06-438f-97a4-03c4167484dc',
        category: 'Restriction of specified conduct or specified acts',
        text: '[NOTIFY YOUR SUPERVISING OFFICER IF YOU / REQUEST PERMISSION FROM YOUR SUPERVISING OFFICER BEFORE YOU] upload, add, modify or stream any material on any site or app related to [SOCIAL NETWORKING / VIDEO SHARING / ONLINE CHAT-ROOMS / PODCASTS].',
        tpl: '{contactType} upload, add, modify or stream any material on any site or app related to {contentTypes}.',
        requiresInput: true,
        inputs: [
          {
            type: 'radio',
            label: 'Select when to contact the supervising officer',
            name: 'contactType',
            options: [
              {
                value: 'Notify your supervising officer if you',
              },
              {
                value: 'Request permission from your supervising officer before you',
              },
            ],
          },
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'contentTypes',
            listType: 'OR',
            options: [
              {
                value: 'social networking',
              },
              {
                value: 'video sharing',
              },
              {
                value: 'online chat-rooms',
              },
              {
                value: 'podcasts',
              },
            ],
          },
        ],
        categoryShort: 'Restriction of conduct or acts',
        type: 'TypesOfWebsites',
        skippable: false,
      },
      {
        code: '50c8c01e-ec95-45f9-ad48-efa89c4faec0',
        category: 'Restriction of specified conduct or specified acts',
        text: 'Not to access any site or app related to [TYPE OF WEBSITE/APP] on any devices without the permission of your supervising officer.',
        tpl: 'Not to access any site or app related to {contentType} on any devices without the permission of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter the type of website or app',
            name: 'contentType',
          },
        ],
        categoryShort: 'Restriction of conduct or acts',
        type: 'WebsiteAccess',
        skippable: false,
      },
      {
        code: '762677a4-4593-4bd2-a4bc-55d49b4c4230',
        category: 'Restriction of specified conduct or specified acts',
        text: 'Not to use or install software or permit installation of software on any of your approved devices related to [VIRTUAL PRIVATE NETWORKS (VPNs) / CLOUD STORAGE / VIRTUAL DESKTOPS / AUTOMATIC DELETION OF CONTENT], without the prior permission of your supervising officer.',
        tpl: 'Not to use or install software or permit installation of software on any of your approved devices related to {services}, without the prior permission of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'services',
            listType: 'OR',
            options: [
              {
                value: 'virtual private networks (VPNs)',
              },
              {
                value: 'cloud storage',
              },
              {
                value: 'virtual desktops',
              },
              {
                value: 'automatic deletion of content',
              },
            ],
          },
        ],
        categoryShort: 'Restriction of conduct or acts',
        type: 'DigitalServices',
        skippable: false,
      },
      {
        code: '86f8b3d6-be31-48b2-a29e-5cf662c95ad1',
        category: 'Extremism',
        text: 'Not to contact directly or indirectly any person whom you know or believe to have been charged or convicted of any extremist related offence, without the prior approval of your supervising officer.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '9785d8f8-31a9-4c32-a06d-eff049ecebcd',
        category: 'Extremism',
        text: 'Not to attend or organise any meetings or gatherings other than those convened solely for the purposes of worship without the prior approval of your supervising officer.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '9efba199-87d4-468e-a5a1-1c0945571afa',
        category: 'Extremism',
        text: 'Not to give or engage in the delivery of any lecture, talk, or sermon whether part of an act of worship or not, without the prior approval of your supervising officer.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '3d771cc6-b85f-47e4-9e13-75bfb80706f4',
        category: 'Extremism',
        text: 'Not to engage in any discussion or act to promote grooming or influencing of an individual or a group for the purpose of extremism or radicalisation.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: 'e0421c22-1be7-4d06-aba7-3c17822b0c1c',
        category: 'Extremism',
        text: 'Not to have in your possession any printed or electronically recorded material or handwritten notes which contain encoded information or that promote the destruction of or hatred for any religious or ethnic group or that celebrates, justifies or promotes acts of violence, or that contain information about military or paramilitary technology, weapons, techniques or tactics without the prior approval of your supervising officer.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '1dc7ee29-df47-48a8-90b6-69e286692d8a',
        category: 'Polygraph',
        text: 'To comply with any instruction given by your supervising officer requiring you to attend polygraph testing. To participate in polygraph sessions and examinations as instructed by or under the authority of your supervising officer and to comply with any instruction given to you during a polygraph session by the person conducting the polygraph.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '322bb3f7-2ee1-46aa-ae1c-3f743efd4327',
        category: 'Drug, alcohol and solvent abuse',
        text: 'Attend a location, as required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour. Do not take any action that could hamper or frustrate the drug testing process.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: 'f1d2888b-be86-4732-8874-44cb867865c2',
        category: 'Drug, alcohol and solvent abuse',
        text: 'Attend a location, as directed by your supervising officer, to address your dependency on, or propensity to misuse, [A CONTROLLED DRUG / ALCOHOL / SOLVENTS].',
        tpl: 'Attend a location, as directed by your supervising officer, to address your dependency on, or propensity to misuse, {substanceTypes}.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'substanceTypes',
            listType: 'AND',
            options: [
              {
                value: 'a controlled drug',
              },
              {
                value: 'alcohol',
              },
              {
                value: 'solvents',
              },
            ],
          },
        ],
        type: 'SubstanceMisuse',
        skippable: false,
      },
      {
        code: 'fd129172-bdd3-4d97-a4a0-efd7b47a49d4',
        category: 'Electronic monitoring',
        text: 'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your [INSERT TYPES OF CONDITIONS TO BE ELECTRONICALLY MONITORED HERE] licence condition(s) unless otherwise authorised by your supervising officer.',
        tpl: 'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your {electronicMonitoringTypes} licence condition(s) unless otherwise authorised by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'electronicMonitoringTypes',
            listType: 'AND',
            options: [
              {
                value: 'exclusion zone',
              },
              {
                value: 'curfew',
              },
              {
                value: 'location monitoring',
              },
              {
                value: 'attendance at appointments',
              },
              {
                value: 'alcohol monitoring',
              },
              {
                value: 'alcohol abstinence',
              },
            ],
          },
        ],
        type: 'ElectronicMonitoringTypes',
        skippable: false,
      },
      {
        code: '524f2fd6-ad53-47dd-8edc-2161d3dd2ed4',
        category: 'Electronic monitoring',
        text: 'You will be subject to trail monitoring. Your whereabouts will be electronically monitored by GPS Satellite Tagging, ending on [INSERT END DATE], and you must cooperate with the monitoring as directed by your supervising officer unless otherwise authorised by your supervising officer.',
        tpl: 'You will be subject to trail monitoring. Your whereabouts will be electronically monitored by GPS Satellite Tagging, ending on {endDate}, and you must cooperate with the monitoring as directed by your supervising officer unless otherwise authorised by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'datePicker',
            label: 'Enter the end date',
            name: 'endDate',
          },
        ],
        type: 'ElectronicMonitoringPeriod',
        skippable: true,
      },
      {
        code: '86e6f2a9-bb60-40f8-9ac4-310ebc72ac2f',
        category: 'Electronic monitoring',
        text: 'You must stay at [APPROVED ADDRESS] between 5pm and midnight every day until your electronic tag is installed unless otherwise authorised by your supervising officer.',
        tpl: 'You must stay at {approvedAddress} between 5pm and midnight every day until your electronic tag is installed unless otherwise authorised by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'address',
            label: 'Enter the approved address',
            name: 'approvedAddress',
          },
        ],
        type: 'ApprovedAddress',
        skippable: false,
      },
      {
        code: 'd36a3b77-30ba-40ce-8953-83e761d3b487',
        category: 'Electronic monitoring',
        text: 'You must not drink any alcohol until [END DATE] unless your probation officer says you can. You will need to wear an electronic tag all the time so we can check this.',
        tpl: 'You must not drink any alcohol until {endDate} unless your probation officer says you can. You will need to wear an electronic tag all the time so we can check this.',
        requiresInput: true,
        inputs: [
          {
            type: 'datePicker',
            label: 'Enter the end date',
            name: 'endDate',
          },
        ],
        type: 'AlcoholRestrictionPeriod',
        skippable: true,
      },
      {
        code: '2F8A5418-C6E4-4F32-9E58-64B23550E504',
        category: 'Electronic monitoring',
        text: 'You will need to wear an electronic tag all the time until [END DATE] so we can check how much alcohol you are drinking, and if you are drinking alcohol when you have been told you must not. To help you drink less alcohol you must take part in any activities, like treatment programmes, your probation officer asks you to.',
        tpl: 'You will need to wear an electronic tag all the time until {endDate} so we can check how much alcohol you are drinking, and if you are drinking alcohol when you have been told you must not. To help you drink less alcohol you must take part in any activities, like treatment programmes, your probation officer asks you to.',
        requiresInput: true,
        inputs: [
          {
            type: 'datePicker',
            label: 'Enter the end date',
            name: 'endDate',
          },
        ],
        type: 'ElectronicTagPeriod',
        skippable: true,
      },
      {
        code: '9678FD9E-F80D-423A-A6FB-B79909094887',
        category: 'Terrorist personal search',
        text: 'You must let the police search you if they ask. You must also let them search a vehicle you are with, like a car or a motorbike.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: 'e8478345-019a-4335-9656-73a77ffd3c42',
        category: 'Serious organised crime',
        text: 'Not to have cash in your possession in excess of the value of [VALUE IN £] without the prior approval of your supervising officer.',
        tpl: 'Not to have cash in your possession in excess of the value of £{value} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter the value in £',
            name: 'value',
          },
        ],
        type: 'CashInPossession',
        skippable: false,
      },
      {
        code: '001328d0-d8bb-48ca-9f99-9c305081d0a2',
        category: 'Serious organised crime',
        text: 'Provide your supervising officer with details of any assets, property or possessions worth over [VALUE IN £].',
        tpl: 'Provide your supervising officer with details of any assets, property or possessions worth over £{value}.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter the value in £',
            name: 'value',
          },
        ],
        type: 'ValueOfAssets',
        skippable: false,
      },
      {
        code: 'a9ef7376-2ab6-4490-a568-a275f4f649ab',
        category: 'Serious organised crime',
        text: 'Provide your supervising officer with copies of your [PAYSLIPS / BANK STATEMENTS / DETAILS OF ALL FORMS OF INCOME] upon their request and no less than once a month.',
        tpl: 'Provide your supervising officer with copies of your {evidenceOfIncome} upon their request and no less than once a month.',
        requiresInput: true,
        inputs: [
          {
            type: 'check',
            label: 'Select all that apply',
            name: 'evidenceOfIncome',
            listType: 'AND',
            options: [
              {
                value: 'payslips',
              },
              {
                value: 'bank statements',
              },
              {
                value: 'details of all forms of income',
              },
            ],
          },
        ],
        type: 'EvidenceOfIncome',
        skippable: false,
      },
      {
        code: '62e035ff-e755-472b-8047-3c5ea1d5b74e',
        category: 'Serious organised crime',
        text: 'Provide your supervising officer with details of any money transfers which you initiate or receive.',
        requiresInput: false,
        skippable: false,
      },
      {
        code: '4e52fd9c-d436-4f82-9032-7813b130f620',
        category: 'Serious organised crime',
        text: 'Provide your supervising officer with the details of the full postal addresses of all premises and storage facilities, including business addresses, to which you have a right of access.',
        requiresInput: false,
        skippable: false,
      },
    ],
    PSS: [
      {
        code: '62c83b80-2223-4562-a195-0670f4072088',
        category: 'Drug appointment',
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        tpl: 'Attend {appointmentAddress}{appointmentDate}{appointmentTime}, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        requiresInput: true,
        pssDates: true,
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
        type: 'AppointmentTimeAndPlaceDuringPss',
        skippable: true,
      },
      {
        code: 'fda24aa9-a2b0-4d49-9c87-23b0a7be4013',
        category: 'Drug testing',
        text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
        tpl: 'Attend {name} {address}, as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
        requiresInput: true,
        inputs: [
          {
            type: 'text',
            label: 'Enter name',
            name: 'name',
          },
          {
            type: 'address',
            label: 'Enter address',
            name: 'address',
          },
        ],
        type: 'DrugTestLocation',
        skippable: false,
      },
    ],
  },
  changeHints: [
    {
      previousCode: '599bdcae-d545-461c-b1a9-02cb3d4ba268',
      replacements: ['d36a3b77-30ba-40ce-8953-83e761d3b487', '2F8A5418-C6E4-4F32-9E58-64B23550E504'],
    },
    {
      previousCode: 'c2435d4a-20a0-47de-b080-e1e740d1514c',
      replacements: ['0a370862-5426-49c1-b6d4-3d074d78a81a', 'fd129172-bdd3-4d97-a4a0-efd7b47a49d4'],
    },
    {
      previousCode: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
      replacements: ['f1d2888b-be86-4732-8874-44cb867865c2'],
    },
    {
      previousCode: '72d281c3-b194-43ab-812d-fea0683ada65',
      replacements: ['3932e5c9-4d21-4251-a747-ce6dc52dc9c0'],
    },
    {
      previousCode: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
      replacements: ['3932e5c9-4d21-4251-a747-ce6dc52dc9c0'],
    },
    {
      previousCode: '680b3b27-43cc-46c6-9ba6-b10d4aba6531',
      replacements: ['2d67f68a-8adf-47a9-a68d-a6fc9f2c4556'],
    },
    {
      previousCode: 'bb401b88-2137-4154-be4a-5e05c168638a',
      replacements: [],
    },
    {
      previousCode: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
      replacements: ['df3f08a8-4ae0-41fe-b3bc-d0be1fd2d8aa', 'f1d2888b-be86-4732-8874-44cb867865c2'],
    },
  ],
}

export default policy
