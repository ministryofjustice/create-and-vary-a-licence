import InputTypes from '../enumeration/inputTypes'
import RegionOfResidence from '../routes/creatingLicences/types/additionalConditionInputs/regionOfResidence'
import RestrictionOfResidency from '../routes/creatingLicences/types/additionalConditionInputs/restrictionOfResidency'
import MedicalAppointmentType from '../routes/creatingLicences/types/additionalConditionInputs/medicalAppointmentType'
import UnsupervisedContact from '../routes/creatingLicences/types/additionalConditionInputs/unsupervisedContact'
import WorkingWithChildren from '../routes/creatingLicences/types/additionalConditionInputs/workingWithChildren'
import IntimateRelationshipWithGender from '../routes/creatingLicences/types/additionalConditionInputs/intimateRelationshipWithGender'
import BehaviourProblems from '../routes/creatingLicences/types/additionalConditionInputs/behaviourProblems'
import AppointmentTimeAndPlace from '../routes/creatingLicences/types/additionalConditionInputs/appointmentTimeAndPlace'
import OutOfBoundsRegion from '../routes/creatingLicences/types/additionalConditionInputs/outOfBoundsRegion'
import OutOfBoundsPremises from '../routes/creatingLicences/types/additionalConditionInputs/outOfBoundsPremises'
import OutOfBoundsPremisesType from '../routes/creatingLicences/types/additionalConditionInputs/outOfBoundsPremisesType'
import DrugTestLocation from '../routes/creatingLicences/types/additionalConditionInputs/drugTestLocation'
import ElectronicMonitoringTypes from '../routes/creatingLicences/types/additionalConditionInputs/electronicMonitoringTypes'
import ElectronicMonitoringPeriod from '../routes/creatingLicences/types/additionalConditionInputs/electronicMonitoringPeriod'
import ApprovedAddress from '../routes/creatingLicences/types/additionalConditionInputs/approvedAddress'
import AlcoholMonitoringPeriod from '../routes/creatingLicences/types/additionalConditionInputs/alcoholMonitoringPeriod'
import CurfewTerms from '../routes/creatingLicences/types/additionalConditionInputs/curfewTerms'
import CurfewAddress from '../routes/creatingLicences/types/additionalConditionInputs/curfewAddress'
import NoContactWithVictim from '../routes/creatingLicences/types/additionalConditionInputs/noContactWithVictim'
import ReportToApprovedPremises from '../routes/creatingLicences/types/additionalConditionInputs/reportToApprovedPremises'
import SpecifiedItem from '../routes/creatingLicences/types/additionalConditionInputs/specifiedItem'
import NamedIndividuals from '../routes/creatingLicences/types/additionalConditionInputs/namedIndividuals'
import NamedOrganisation from '../routes/creatingLicences/types/additionalConditionInputs/namedOrganisation'
import ReportToPoliceStation from '../routes/creatingLicences/types/additionalConditionInputs/reportToPoliceStation'
import AppointmentTimeAndPlaceDuringPss from '../routes/creatingLicences/types/additionalConditionInputs/appointmentTimeAndPlaceDuringPss'

export default {
  version: '2.0',

  /*
    Each condition below has a universally unique identifier (UUID) as its 'code'.
    This UUID should stay constant for the entire lifetime of the condition policy.

    If a change in policy means the content of a particular licence condition should be updated, including conditions on any existing or varied licences,
    then the content can be changed here whilst ensuring the condition keeps the same UUID.

    Any condition added with a new UUID will be treated as a new condition and any edit of an in-flight or varied licence will not be affected by the change.

    A UUID can be generated on MacOS or Linux terminal by running the command 'uuidgen'
 */
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
        text: 'You must reside within the [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
        tpl: 'You must reside within the {probationRegion} probation region while of no fixed abode, unless otherwise approved by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.RADIO,
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
        type: RegionOfResidence,
      },
      {
        code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
        category: 'Restriction of residency',
        text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
        tpl: 'Not to reside (not even to stay for one night) in the same household as {gender} child under the age of {age} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.RADIO,
            label: 'Select the relevant text',
            name: 'gender',
            case: 'lower',
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
          },
          {
            type: InputTypes.RADIO,
            label: 'Select the relevant age',
            name: 'age',
            options: [
              {
                value: '16',
              },
              {
                value: '18',
              },
            ],
          },
        ],
        type: RestrictionOfResidency,
      },
      {
        code: 'b72fdbf2-0dc9-4e7f-81e4-c2ccb5d1bc90',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Attend all appointments arranged for you with a [PSYCHIATRIST / PSYCHOLOGIST / MEDICAL PRACTITIONER].',
        tpl: 'Attend all appointments arranged for you with a {appointmentType}.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.CHECK,
            label: 'Select all the relevant options',
            name: 'appointmentType',
            case: 'lower',
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
          },
        ],
        type: MedicalAppointmentType,
      },
      {
        code: '9ae2a336-3491-4667-aaed-dd852b09b4b9',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Receive home visits from a Mental Health Worker.',
        requiresInput: false,
      },
      {
        code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        tpl: 'Attend {appointmentAddress}{appointmentDate}{appointmentTime}, as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TIME,
            label: 'Enter time (optional)',
            name: 'appointmentTime',
            includeBefore: ' at ',
          },
          {
            type: InputTypes.DATE,
            label: 'Enter date (optional)',
            name: 'appointmentDate',
            includeBefore: ' on ',
          },
          {
            type: InputTypes.ADDRESS,
            label: 'Enter the address for the appointment',
            name: 'appointmentAddress',
          },
        ],
        type: AppointmentTimeAndPlace,
      },
      {
        code: '75a6aac6-02a7-4414-af14-942be6736892',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to your supervising officer.',
        requiresInput: false,
      },
      {
        code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
        tpl: 'Not to seek to approach or communicate with {name} without the prior approval of your supervising officer{socialServicesDepartment}.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter name of victim or family member',
            name: 'name',
            listType: 'OR',
            case: 'capitalise',
            addAnother: {
              label: 'Add another person',
            },
          },
          {
            type: InputTypes.TEXT,
            label: 'Enter social services department (optional)',
            name: 'socialServicesDepartment',
            includeBefore: ' and / or ',
            case: 'capitalise',
          },
        ],
        type: NoContactWithVictim,
      },
      {
        code: '4a5fed48-0fb9-4711-8ddf-b46ddfd90246',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Not to have unsupervised contact with [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
        tpl: 'Not to have unsupervised contact with {gender} children under the age of {age} without the prior approval of your supervising officer{socialServicesDepartment} except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.RADIO,
            label: 'Select the relevant gender',
            name: 'gender',
            case: 'lower',
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
          },
          {
            type: InputTypes.RADIO,
            label: 'Select the relevant age',
            name: 'age',
            options: [
              {
                value: '16 years',
              },
              {
                value: '18 years',
              },
            ],
          },
          {
            type: InputTypes.TEXT,
            label: 'Enter social services department (optional)',
            name: 'socialServicesDepartment',
            includeBefore: ' and / or ',
            case: 'capitalise',
          },
        ],
        type: UnsupervisedContact,
      },
      {
        code: '355700a9-6184-40c0-9759-0dfed1994e1e',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
        tpl: 'Not to contact or associate with {nameOfIndividual} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter name of offender or individual',
            name: 'nameOfIndividual',
            listType: 'OR',
            case: 'capitalise',
            addAnother: {
              label: 'Add another person',
            },
          },
        ],
        type: NamedIndividuals,
      },
      {
        code: '0aa669bf-db8a-4b8e-b8ba-ca82fc245b94',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: 'cc80d02b-0b62-4940-bac6-0bcd374c725e',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Not to contact directly or indirectly any person who is a serving or remand prisoner or detained in State custody, without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: '18b69f61-800f-46b2-95c4-2019d33e34d6',
        category: 'Making or maintaining contact with a person',
        categoryShort: 'Contact with a person',
        text: 'Not to associate with any person currently or formerly associated with [NAMES OF SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
        tpl: 'Not to associate with any person currently or formerly associated with {nameOfOrganisation} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter the name of group or organisation',
            name: 'nameOfOrganisation',
            listType: 'OR',
            addAnother: {
              label: 'Add another group or organisation',
            },
          },
        ],
        type: NamedOrganisation,
      },
      {
        code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        categoryShort: 'Programmes or activities',
        text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems at the [NAME OF COURSE / CENTRE].',
        tpl: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your {behaviourProblems} problems{course}.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.CHECK,
            label: 'Select all that apply',
            name: 'behaviourProblems',
            listType: 'AND',
            options: [
              {
                value: 'alcohol',
              },
              {
                value: 'drug',
              },
              {
                value: 'sexual',
              },
              {
                value: 'violent',
              },
              {
                value: 'gambling',
              },
              {
                value: 'solvent abuse',
              },
              {
                value: 'anger',
              },
              {
                value: 'debt',
              },
              {
                value: 'prolific offending behaviour',
              },
              {
                value: 'offending behaviour',
              },
            ],
          },
          {
            type: InputTypes.TEXT,
            label: 'Enter name of course or centre (optional)',
            name: 'course',
            includeBefore: ' at the ',
          },
        ],
        type: BehaviourProblems,
      },
      {
        code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        categoryShort: 'Programmes or activities',
        text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer.',
        tpl: 'Not to undertake work or other organised activity which will involve a person under the age of {age}, either on a paid or unpaid basis without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.RADIO,
            label: 'Select the relevant age',
            name: 'age',
            options: [
              {
                value: '16 years',
              },
              {
                value: '18 years',
              },
            ],
          },
        ],
        type: WorkingWithChildren,
      },
      {
        code: '0EDB6D01-46B6-408F-971C-0EBFF5FA93F0',
        category: 'Participation in, or co-operation with, a programme or set of activities',
        categoryShort: 'Programmes or activities',
        text: 'To engage with the Integrated Offender Management Team, and follow their instructions.',
        requiresInput: false,
      },
      {
        code: '8e52e16e-1abf-4251-baca-2fabfcb243d0',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone or one you have regular use of, including the IMEI number and the SIM card that you possess.',
        requiresInput: false,
      },
      {
        code: '72d281c3-b194-43ab-812d-fea0683ada65',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'Not to own or use a camera without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: '680b3b27-43cc-46c6-9ba6-b10d4aba6531',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
        requiresInput: false,
      },
      {
        code: '5fa04bbf-6b7c-4b65-9388-a0115cd365a6',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
        requiresInput: false,
      },
      {
        code: 'bfbc693c-ab65-4042-920e-ddb085bc7aba',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a specific location, as specified by that officer.',
        requiresInput: false,
      },
      {
        code: '2d67f68a-8adf-47a9-a68d-a6fc9f2c4556',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
        requiresInput: false,
      },
      {
        code: '3932e5c9-4d21-4251-a747-ce6dc52dc9c0',
        category: 'Possession, ownership, control or inspection of specified items or documents',
        categoryShort: 'Items and documents',
        text: 'Not to own or possess a [SPECIFIED ITEM] without the prior approval of your supervising officer.',
        tpl: 'Not to own or possess {item} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter the name of the item',
            name: 'item',
            listType: 'OR',
            handleIndefiniteArticle: true,
            addAnother: {
              label: 'Add another item',
            },
          },
        ],
        type: SpecifiedItem,
      },
      {
        code: '2a93b784-b8cb-49ed-95e2-a0df60723cda',
        category: 'Disclosure of information',
        text: 'Provide your supervising officer with details (such as make, model, colour, registration) of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
        requiresInput: false,
      },
      {
        code: 'db2d7e24-b130-4c7e-a1bf-6bb5f3036c02',
        category: 'Disclosure of information',
        text: 'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
        tpl: 'Notify your supervising officer of any developing intimate relationships with {gender}.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.RADIO,
            label: 'Select the relevant text',
            name: 'gender',
            case: 'lower',
            options: [
              {
                value: 'men',
              },
              {
                value: 'women',
              },
              {
                value: 'women or men',
              },
            ],
          },
        ],
        type: IntimateRelationshipWithGender,
      },
      {
        code: 'c5e91330-748d-46f3-93f6-bbe5ea8324ce',
        category: 'Disclosure of information',
        text: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
        requiresInput: false,
      },
      {
        code: '79ac033f-9d7a-4dab-8344-475106e58b71',
        category: 'Disclosure of information',
        text: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
        requiresInput: false,
      },
      {
        code: '8686a815-b7f0-43b6-9886-f01df6a48773',
        category: 'Disclosure of information',
        text: 'Provide your supervising officer with the details of any bank accounts to which you are a signatory and of any credit cards you possess. You must also notify your supervising officer when becoming a signatory to any new bank account or credit card, and provide the account/card details. This condition will be reviewed on a monthly basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
        requiresInput: false,
      },
      {
        code: '0a370862-5426-49c1-b6d4-3d074d78a81a',
        category: 'Curfew arrangement',
        text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
        tpl: 'Confine yourself to an address approved by your supervising officer between the hours of {curfewStart} and {curfewEnd} daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
        subtext: 'You must have PPCS approval if the curfew time is longer than 12 hours.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TIME,
            label: 'Enter the curfew start time',
            name: 'curfewStart',
          },
          {
            type: InputTypes.TIME,
            label: 'Enter the curfew end time',
            name: 'curfewEnd',
          },
          {
            type: InputTypes.RADIO,
            label: 'Select a review period',
            name: 'reviewPeriod',
            case: 'lower',
            handleIndefiniteArticle: true,
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
                      type: InputTypes.TEXT,
                      label: 'Enter a review period',
                      name: 'alternativeReviewPeriod',
                      case: 'lower',
                      handleIndefiniteArticle: true,
                    },
                  ],
                },
              },
            ],
          },
        ],
        type: CurfewTerms,
      },
      {
        code: 'c2435d4a-20a0-47de-b080-e1e740d1514c',
        category: 'Curfew arrangement',
        text: 'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored (whether by electronic means involving your wearing an electronic tag or otherwise).',
        tpl: 'Confine yourself to remain at {curfewAddress} initially from {curfewStart} until {curfewEnd} each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored (whether by electronic means involving your wearing an electronic tag or otherwise).',
        subtext: 'You must have PPCS approval if the curfew time is longer than 12 hours.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.ADDRESS,
            label: 'Enter the curfew address',
            name: 'curfewAddress',
          },
          {
            type: InputTypes.TIME,
            label: 'Enter the curfew start time',
            name: 'curfewStart',
          },
          {
            type: InputTypes.TIME,
            label: 'Enter the curfew end time',
            name: 'curfewEnd',
          },
        ],
        type: CurfewAddress,
      },
      {
        code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
        category: 'Freedom of movement',
        text: 'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
        subtext: null,
        tpl: 'Not to enter the area of {outOfBoundArea}, as defined by the attached map without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter the name of area shown on the map',
            name: 'outOfBoundArea',
          },
          {
            type: InputTypes.FILE_UPLOAD,
            label:
              'Find and select the <a class="govuk-link" href="https://mapmaker.field-dynamics.co.uk/moj/map/default" rel="noreferrer noopener" target="_blank">Mapmaker PDF map</a> to include on the licence',
            name: 'outOfBoundFilename',
          },
        ],
        type: OutOfBoundsRegion,
      },
      {
        code: '42f71b40-84cd-446d-8647-f00bbb6c079c',
        category: 'Freedom of movement',
        text: 'Not to enter [NAME / TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
        tpl: 'Not to enter {nameOfPremises} {premisesAddress} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter name or type of premises',
            name: 'nameOfPremises',
          },
          {
            type: InputTypes.ADDRESS,
            label: 'Enter the address of the premises',
            name: 'premisesAddress',
          },
        ],
        type: OutOfBoundsPremises,
      },
      {
        code: 'c4a17002-88a3-43b4-b3f7-82ff476cb217',
        category: 'Freedom of movement',
        text: "Not to enter or remain in sight of any [CHILDREN'S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.",
        tpl: 'Not to enter or remain in sight of any {typeOfPremises} without the prior approval of your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter area or type of premises',
            name: 'typeOfPremises',
            case: 'lower',
          },
        ],
        type: OutOfBoundsPremisesType,
      },
      {
        code: 'bb401b88-2137-4154-be4a-5e05c168638a',
        category: 'Freedom of movement',
        text: 'On release to be escorted by police to Approved Premises.',
        requiresInput: false,
      },
      {
        code: '5d0416a9-a4ce-4b2c-8636-0b7abaa3680a',
        category: 'Freedom of movement',
        text: 'To only attend places of worship which have been previously agreed with your supervising officer.',
        requiresInput: false,
      },
      {
        code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        categoryShort: 'Supervision in the community',
        text: 'Report to staff at [NAME OF APPROVED PREMISES] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        tpl: 'Report to staff at {approvedPremises} at {reportingTime}, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter name of approved premises',
            name: 'approvedPremises',
            case: 'capitalised',
          },
          {
            type: InputTypes.TIME,
            label: 'Enter a reporting time',
            name: 'reportingTime',
          },
          {
            type: InputTypes.RADIO,
            label: 'Select a review period',
            name: 'reviewPeriod',
            case: 'lower',
            handleIndefiniteArticle: true,
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
                      type: InputTypes.TEXT,
                      label: 'Enter a review period',
                      name: 'alternativeReviewPeriod',
                      case: 'lower',
                      handleIndefiniteArticle: true,
                    },
                  ],
                },
              },
            ],
          },
        ],
        type: ReportToApprovedPremises,
      },
      {
        code: '2027ae19-04a2-4fa6-8d1b-a62dffba2e62',
        category:
          'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
        categoryShort: 'Supervision in the community',
        text: 'Report to staff at [NAME OF POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        tpl: 'Report to staff at {policeStation} at {reportingTime}, unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on {alternativeReviewPeriod || reviewPeriod} basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter name of police station',
            name: 'policeStation',
            case: 'capitalised',
          },
          {
            type: InputTypes.TIME,
            label: 'Enter a reporting time',
            name: 'reportingTime',
          },
          {
            type: InputTypes.RADIO,
            label: 'Select a review period',
            name: 'reviewPeriod',
            case: 'lower',
            handleIndefiniteArticle: true,
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
                      type: InputTypes.TEXT,
                      label: 'Enter a review period',
                      name: 'alternativeReviewPeriod',
                      case: 'lower',
                      handleIndefiniteArticle: true,
                    },
                  ],
                },
              },
            ],
          },
        ],
        type: ReportToPoliceStation,
      },
      {
        code: '7a9ca3bb-922a-433a-9601-1e475c6c0095',
        category: 'Restriction of specified conduct or specified acts',
        categoryShort: 'Restriction of conduct or acts',
        text: 'Not to participate directly or indirectly in organising and/or contributing to any demonstration, meeting, gathering or website without the prior approval of your supervising officer. This condition will be reviewed on a monthly basis and may be amended or removed if your risk is assessed as having changed.',
        requiresInput: false,
      },
      {
        code: '86f8b3d6-be31-48b2-a29e-5cf662c95ad1',
        category: 'Extremism',
        text: 'Not to contact directly or indirectly any person whom you know or believe to have been charged or convicted of any extremist related offence, without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: '9785d8f8-31a9-4c32-a06d-eff049ecebcd',
        category: 'Extremism',
        text: 'Not to attend or organise any meetings or gatherings other than those convened solely for the purposes of worship without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: '9efba199-87d4-468e-a5a1-1c0945571afa',
        category: 'Extremism',
        text: 'Not to give or engage in the delivery of any lecture, talk, or sermon whether part of an act of worship or not, without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: '3d771cc6-b85f-47e4-9e13-75bfb80706f4',
        category: 'Extremism',
        text: 'Not to engage in any discussion or act to promote grooming or influencing of an individual or a group for the purpose of extremism or radicalisation.',
        requiresInput: false,
      },
      {
        code: 'e0421c22-1be7-4d06-aba7-3c17822b0c1c',
        category: 'Extremism',
        text: 'Not to have in your possession any printed or electronically recorded material or handwritten notes which contain encoded information or that promote the destruction of or hatred for any religious or ethnic group or that celebrates, justifies or promotes acts of violence, or that contain information about military or paramilitary technology, weapons, techniques or tactics without the prior approval of your supervising officer.',
        requiresInput: false,
      },
      {
        code: '1dc7ee29-df47-48a8-90b6-69e286692d8a',
        category: 'Polygraph',
        text: 'To comply with any instruction given by your supervising officer requiring you to attend polygraph testing. To participate in polygraph sessions and examinations as instructed by or under the authority of your supervising officer and to comply with any instruction given to you during a polygraph session by the person conducting the polygraph.',
        requiresInput: false,
      },
      {
        code: '322bb3f7-2ee1-46aa-ae1c-3f743efd4327',
        category: 'Drug testing',
        text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour. Not to take any action that could hamper or frustrate the drug testing process.',
        tpl: 'Attend {name} {address}, as reasonably required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour. Not to take any action that could hamper or frustrate the drug testing process.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter name of organisation',
            name: 'name',
          },
          {
            type: InputTypes.ADDRESS,
            label: 'Enter address',
            name: 'address',
          },
        ],
        type: DrugTestLocation,
      },
      {
        code: 'fd129172-bdd3-4d97-a4a0-efd7b47a49d4',
        category: 'Electronic monitoring',
        text: 'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your [INSERT TYPES OF CONDITIONS TO BE ELECTRONICALLY MONITORED HERE] licence condition(s) unless otherwise authorised by your supervising officer.',
        tpl: 'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your {electronicMonitoringTypes} licence condition(s) unless otherwise authorised by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.CHECK,
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
        type: ElectronicMonitoringTypes,
      },
      {
        code: '524f2fd6-ad53-47dd-8edc-2161d3dd2ed4',
        category: 'Electronic monitoring',
        text: 'You will be subject to trail monitoring. Your whereabouts will be electronically monitored by GPS Satellite Tagging, ending on [INSERT END DATE], and you must cooperate with the monitoring as directed by your supervising officer unless otherwise authorised by your supervising officer.',
        tpl: 'You will be subject to trail monitoring. Your whereabouts will be electronically monitored by GPS Satellite Tagging, ending on {endDate}, and you must cooperate with the monitoring as directed by your supervising officer unless otherwise authorised by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.DATE,
            label: 'Enter the end date',
            name: 'endDate',
          },
        ],
        type: ElectronicMonitoringPeriod,
      },
      {
        code: '86e6f2a9-bb60-40f8-9ac4-310ebc72ac2f',
        category: 'Electronic monitoring',
        text: 'You must stay at [APPROVED ADDRESS] between 5pm and midnight every day until your electronic tag is installed unless otherwise authorised by your supervising officer.',
        tpl: 'You must stay at {approvedAddress} between 5pm and midnight every day until your electronic tag is installed unless otherwise authorised by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.ADDRESS,
            label: 'Enter the approved address',
            name: 'approvedAddress',
          },
        ],
        type: ApprovedAddress,
      },
      {
        code: '599bdcae-d545-461c-b1a9-02cb3d4ba268',
        category: 'Electronic monitoring',
        text: 'You are subject to alcohol monitoring. Your alcohol intake will be electronically monitored for a period of [INSERT TIMEFRAME] ending on [END DATE], and you may not consume units of alcohol, unless otherwise permitted by your supervising officer.',
        tpl: 'You are subject to alcohol monitoring. Your alcohol intake will be electronically monitored for a period of {timeframe} ending on {endDate}, and you may not consume units of alcohol, unless otherwise permitted by your supervising officer.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter the timeframe',
            name: 'timeframe',
          },
          {
            type: InputTypes.DATE,
            label: 'Enter the end date',
            name: 'endDate',
          },
        ],
        type: AlcoholMonitoringPeriod,
      },
      {
        code: '9678FD9E-F80D-423A-A6FB-B79909094887',
        category: 'Terrorist personal search',
        text: 'You must let the police search you if they ask. You must also let them search a vehicle you are with, like a car or a motorbike.',
        requiresInput: false,
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
            type: InputTypes.TIME,
            label: 'Enter time (optional)',
            name: 'appointmentTime',
            includeBefore: ' at ',
          },
          {
            type: InputTypes.DATE,
            label: 'Enter date (optional)',
            name: 'appointmentDate',
            includeBefore: ' on ',
          },
          {
            type: InputTypes.ADDRESS,
            label: 'Enter the address for the appointment',
            name: 'appointmentAddress',
          },
        ],
        type: AppointmentTimeAndPlaceDuringPss,
      },
      {
        code: 'fda24aa9-a2b0-4d49-9c87-23b0a7be4013',
        category: 'Drug testing',
        text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
        tpl: 'Attend {name} {address}, as reasonably required by your supervisor, to give a sample of oral fluid / urine in order to test whether you have any specified Class A or specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of your supervision period requiring you to be of good behaviour.',
        requiresInput: true,
        inputs: [
          {
            type: InputTypes.TEXT,
            label: 'Enter name',
            name: 'name',
          },
          {
            type: InputTypes.ADDRESS,
            label: 'Enter address',
            name: 'address',
          },
        ],
        type: DrugTestLocation,
      },
    ],
  },
}
