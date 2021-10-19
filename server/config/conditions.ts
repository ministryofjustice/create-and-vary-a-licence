export default {
  version: '1.0',
  standardConditions: {
    AP: [
      {
        code: 'generalGoodBehaviour',
        text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period.',
        sequence: 1,
      },
      {
        code: 'noOffences',
        text: 'Not commit any offence.',
        sequence: 1,
      },
      {
        code: 'keepInTouch',
        text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer.',
        sequence: 1,
      },
      {
        code: 'takeVisits',
        text: 'Receive visits from the supervising officer in accordance with instructions given by the supervising officer.',
        sequence: 1,
      },
      {
        code: 'residence',
        text: 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address.',
        sequence: 1,
      },
      {
        code: 'noEmployment',
        text: 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work.',
        sequence: 1,
      },
      {
        code: 'noTravel',
        text: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal.',
        sequence: 1,
      },
    ],
  },
  // TODO: Use 32 character uuid
  additionalConditions: [
    {
      id: '08d76e4f-eab9-42d0-8',
      groupName: 'Residence at a specific place',
      text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
    },
    {
      id: 'e5786f33-f217-4551-9',
      groupName: 'Restriction of residency',
      text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
    },
    {
      id: '2d18bddd-0cd1-4502-b',
      groupName: 'Making or maintaining contact with a person',
      text: 'Attend all appointments arranged for you with a psychiatrist / psychologist / medical practitioner.',
    },
    {
      id: 'bf8e81e7-ea0d-4010-a',
      groupName: 'Making or maintaining contact with a person',
      text: 'Receive home visits from a Mental Health Worker.',
    },
    {
      id: '3d131c8d-7fcd-44cd-a',
      groupName: 'Making or maintaining contact with a person',
      text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
    },
    {
      id: 'e1136b98-9193-4f58-b',
      groupName: 'Making or maintaining contact with a person',
      text: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to your supervising officer.',
    },
    {
      id: 'bd6385f8-2aa9-4d0b-a',
      groupName: 'Making or maintaining contact with a person',
      text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
    },
    {
      id: '5377cdae-73f8-44d3-9',
      groupName: 'Making or maintaining contact with a person',
      text: 'Not to have unsupervised contact with [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
    },
    {
      id: '98d8c3af-6633-420a-a',
      groupName: 'Making or maintaining contact with a person',
      text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
    },
    {
      id: 'dcf929e8-11e6-473d-b',
      groupName: 'Making or maintaining contact with a person',
      text: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
    },
    {
      id: '02a304e1-7755-434f-9',
      groupName: 'Making or maintaining contact with a person',
      text: 'Not to contact directly or indirectly any person who is a serving or remand prisoner or detained in State custody, without the prior approval of your supervising officer.',
    },
    {
      id: '73b6f2dc-dc21-4ac0-b',
      groupName: 'Making or maintaining contact with a person',
      text: 'Not to associate with any person currently or formerly associated with [NAME OF DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
    },
    {
      id: 'af1ed373-6344-4c51-9',
      groupName: 'Participation in, or co-operation with, a programme or set of activities',
      text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems.',
    },
    {
      id: 'e56643ed-de9e-4453-8',
      groupName: 'Participation in, or co-operation with, a programme or set of activities',
      text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer;.',
    },
    {
      id: '37352e3d-007d-49cb-9',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone or one you have regular use of, including the IMEI number and the SIM card that you possess.',
    },
    {
      id: '26e9bfec-fea7-4808-9',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
    },
    {
      id: 'f2473e56-2197-4428-8',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or use a camera without the prior approval of your supervising officer.',
    },
    {
      id: '1a5d020f-310d-4abe-9',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
    },
    {
      id: 'a1c89547-4429-477f-a',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
    },
    {
      id: 'b2e77d52-ed1c-4f66-b',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a specific location, as specified by that officer.',
    },
    {
      id: '5b0f3320-14f9-4b91-9',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
    },
    {
      id: '3b9cab8d-9be8-4d07-b',
      groupName: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or possess a [SPECIFIED ITEM) without the prior approval of your supervising officer.',
    },
    {
      id: 'ca7f0b75-6ec8-4178-9',
      groupName: 'Disclosure of information',
      text: 'Provide your supervising officer with details (such as make, model, colour, registration) of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
    },
    {
      id: 'f9729724-16b1-4134-b',
      groupName: 'Disclosure of information',
      text: 'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
    },
    {
      id: '1764d2f1-0ef5-49c4-9',
      groupName: 'Disclosure of information',
      text: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
    },
    {
      id: 'e7e656f2-7399-4687-8',
      groupName: 'Disclosure of information',
      text: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
    },
    {
      id: 'feaa2d6c-bac1-41db-b',
      groupName: 'Disclosure of information',
      text: 'Provide your supervising officer with the details of any bank accounts to which you are a signatory and of any credit cards you possess. You must also notify your supervising officer when becoming a signatory to any new bank account or credit card, and provide the account/card details. This condition will be reviewed on a monthly basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    },
    {
      id: '25121d95-3073-493a-8',
      groupName: 'Curfew arrangement',
      text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    },
    {
      id: '24ecad7c-83c1-4973-a',
      groupName: 'Curfew arrangement',
      text: 'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored (whether by electronic means involving your wearing an electronic tag or otherwise).',
    },
    {
      id: '4cb347b3-caae-452c-9',
      groupName: 'Freedom of movement',
      text: 'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
    },
    {
      id: '89866d4e-4d93-49c8-b',
      groupName: 'Freedom of movement',
      text: 'Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
    },
    {
      id: 'c98d465f-6bdd-45cc-8',
      groupName: 'Freedom of movement',
      text: "Not to enter or remain in sight of any [CHILDREN'S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.",
    },
    {
      id: '492dc574-2dbc-4307-8',
      groupName: 'Freedom of movement',
      text: 'On release to be escorted by police to Approved Premises.',
    },
    {
      id: '06e1ee96-d6d6-4f60-8',
      groupName: 'Freedom of movement',
      text: 'To only attend places of worship which have been previously agreed with your supervising officer.',
    },
    {
      id: '81f662f6-fe21-40c5-b',
      groupName:
        'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
      text: 'Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
    },
    {
      id: 'faf9f00d-8b8e-4c9c-9',
      groupName: 'Restriction of specified conduct or specified acts',
      text: 'Not to participate directly or indirectly in organising and/or contributing to any demonstration, meeting, gathering or website without the prior approval of your supervising officer. This condition will be reviewed on a monthly basis and may be amended or removed if your risk is assessed as having changed.',
    },
    {
      id: 'ba31b4b6-6872-4e9e-9',
      groupName: 'Extremism',
      text: 'Not to contact directly or indirectly any person whom you know or believe to have been charged or convicted of any extremist related offence, without the prior approval of your supervising officer.',
    },
    {
      id: '1b65ec60-19b8-4413-8',
      groupName: 'Extremism',
      text: 'Not to attend or organise any meetings or gatherings other than those convened solely for the purposes of worship without the prior approval of your supervising officer.',
    },
    {
      id: 'bdcc1dca-11ee-4f1c-b',
      groupName: 'Extremism',
      text: 'Not to give or engage in the delivery of any lecture, talk, or sermon whether part of an act of worship or not, without the prior approval of your supervising officer.',
    },
    {
      id: 'c527cbc7-de4c-4c46-9',
      groupName: 'Extremism',
      text: 'Not to engage in any discussion or act to promote grooming or influencing of an individual or a group for the purpose of extremism or radicalisation.',
    },
    {
      id: '1bdec6d9-b300-4cf4-a',
      groupName: 'Extremism',
      text: 'Not to have in your possession any printed or electronically recorded material or handwritten notes which contain encoded information or that promote the destruction of or hatred for any religious or ethnic group or that celebrates, justifies or promotes acts of violence, or that contain information about military or paramilitary technology, weapons, techniques or tactics without the prior approval of your supervising officer.',
    },
    {
      id: 'f9fae904-d980-408c-b',
      groupName: 'Polygraph',
      text: 'To comply with any instruction given by your supervising officer requiring you to attend polygraph testing. To participate in polygraph sessions and examinations as instructed by or under the authority of your supervising officer and to comply with any instruction given to you during a polygraph session by the person conducting the polygraph.',
    },
    {
      id: '1310e854-d285-4c7c-8',
      groupName: 'Drug testing',
      text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour.',
    },
    {
      id: '1fe44147-db93-40e9-9',
      groupName: 'Drug testing',
      text: 'Not to take any action that could hamper or frustrate the drug testing process.',
    },
    {
      id: '0323b20c-5f2f-4b68-b',
      groupName: 'Electronic monitoring',
      text: 'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your [INSERT TYPES OF CONDITIONS TO BE ELECTRONICALLY MONITORED HERE] licence condition(s) unless otherwise authorised by your supervising officer.',
    },
    {
      id: '2091f819-6d98-418b-9',
      groupName: 'Electronic monitoring',
      text: 'You will be subject to trail monitoring. Your whereabouts will be electronically monitored by GPS Satellite Tagging, ending on [INSERT END DATE], and you must cooperate with the monitoring as directed by your supervising officer unless otherwise authorised by your supervising officer. .',
    },
    {
      id: '0782f79e-858e-4cdc-a',
      groupName: 'Electronic monitoring',
      text: 'You must stay at [approved address] between 5pm and midnight every day until your electronic tag is installed unless otherwise authorised by your supervising officer.',
    },
    {
      id: '7127ebb7-8133-4708-8',
      groupName: 'Electronic monitoring',
      text: 'You are subject to alcohol monitoring. Your alcohol intake will be electronically monitoring for a period of [INSERT TIMEFRAME AND END DATE], and you may not consume units of alcohol, unless otherwise permitted by your supervising officer.',
    },
  ],
}
