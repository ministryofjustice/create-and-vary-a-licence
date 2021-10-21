export default {
  version: '1.0',

  /*
    Each condition below has a universally unique identifier (UUID) as its 'code'.
    This UUID should stay constant for the entire lifetime of the condition policy.

    If a change in policy means the content of a particular licence condition should be updated, including conditions on any existing or varied licences,
    then the content can be changed here whilst ensuring the condition keeps the same UUID.

    Any condition added with a new UUID will be treated as a new condition and any edit of an in-flight or varied licence will not be affected by the change.

    A UUID can be generated on MacOS or Linux terminal by running the command 'uuidgen'
 */
  // TODO: Standard conditons are not yet subject to the above comment about UUID - Remove the sequence numbers from config + replace codes with UUID (needs DB schema change)
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
  // TODO: Add input template names for conditions which require additional data
  additionalConditions: [
    {
      code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
      category: 'Residence at a specific place',
      text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
    },
    {
      code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
      category: 'Restriction of residency',
      text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
    },
    {
      code: 'b72fdbf2-0dc9-4e7f-81e4-c2ccb5d1bc90',
      category: 'Making or maintaining contact with a person',
      text: 'Attend all appointments arranged for you with a psychiatrist / psychologist / medical practitioner.',
    },
    {
      code: '9ae2a336-3491-4667-aaed-dd852b09b4b9',
      category: 'Making or maintaining contact with a person',
      text: 'Receive home visits from a Mental Health Worker.',
    },
    {
      code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
      category: 'Making or maintaining contact with a person',
      text: 'Attend [INSERT APPOINTMENT TIME DATE AND ADDRESS], as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
    },
    {
      code: '75a6aac6-02a7-4414-af14-942be6736892',
      category: 'Making or maintaining contact with a person',
      text: 'Should you return to the UK and Islands before the expiry date of your licence then your licence conditions will be in force and you must report within two working days to your supervising officer.',
    },
    {
      code: '4858cd8b-bca6-4f11-b6ee-439e27216d7d',
      category: 'Making or maintaining contact with a person',
      text: 'Not to seek to approach or communicate with [INSERT NAME OF VICTIM AND / OR FAMILY MEMBERS] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT].',
    },
    {
      code: '4a5fed48-0fb9-4711-8ddf-b46ddfd90246',
      category: 'Making or maintaining contact with a person',
      text: 'Not to have unsupervised contact with [ANY / ANY FEMALE / ANY MALE] children under the age of [INSERT AGE] without the prior approval of your supervising officer and / or [INSERT NAME OF APPROPRIATE SOCIAL SERVICES DEPARTMENT] except where that contact is inadvertent and not reasonably avoidable in the course of lawful daily life.',
    },
    {
      code: '355700a9-6184-40c0-9759-0dfed1994e1e',
      category: 'Making or maintaining contact with a person',
      text: 'Not to contact or associate with [NAMED OFFENDER(S) / NAMED INDIVIDUAL(S)] without the prior approval of your supervising officer.',
    },
    {
      code: '0aa669bf-db8a-4b8e-b8ba-ca82fc245b94',
      category: 'Making or maintaining contact with a person',
      text: 'Not to contact or associate with a known sex offender other than when compelled by attendance at a Treatment Programme or when residing at Approved Premises without the prior approval of your supervising officer.',
    },
    {
      code: 'cc80d02b-0b62-4940-bac6-0bcd374c725e',
      category: 'Making or maintaining contact with a person',
      text: 'Not to contact directly or indirectly any person who is a serving or remand prisoner or detained in State custody, without the prior approval of your supervising officer.',
    },
    {
      code: '18b69f61-800f-46b2-95c4-2019d33e34d6',
      category: 'Making or maintaining contact with a person',
      text: 'Not to associate with any person currently or formerly associated with [NAME OF DESCRIBE SPECIFIC GROUPS OR ORGANISATIONS] without the prior approval of your supervising officer.',
    },
    {
      code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
      category: 'Participation in, or co-operation with, a programme or set of activities',
      text: 'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol / drug / sexual / violent / gambling / solvent abuse / anger / debt / prolific / offending behaviour problems.',
    },
    {
      code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
      category: 'Participation in, or co-operation with, a programme or set of activities',
      text: 'Not to undertake work or other organised activity which will involve a person under the age of [INSERT AGE], either on a paid or unpaid basis without the prior approval of your supervising officer;.',
    },
    {
      code: '8e52e16e-1abf-4251-baca-2fabfcb243d0',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or possess more than one mobile phone or SIM card without the prior approval of your supervising officer and to provide your supervising officer with details of that mobile telephone or one you have regular use of, including the IMEI number and the SIM card that you possess.',
    },
    {
      code: '72d281c3-b194-43ab-812d-fea0683ada65',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or possess a mobile phone with a photographic function without the prior approval of your supervising officer.',
    },
    {
      code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or use a camera without the prior approval of your supervising officer.',
    },
    {
      code: '680b3b27-43cc-46c6-9ba6-b10d4aba6531',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'To make any device capable of making or storing digital images (including a camera and a mobile phone with a camera function) available for inspection on request by your supervising officer and/or a police officer.',
    },
    {
      code: '5fa04bbf-6b7c-4b65-9388-a0115cd365a6',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'To surrender your passport(s) to your supervising officer and to notify your supervising officer of any intention to apply for a new passport.',
    },
    {
      code: 'bfbc693c-ab65-4042-920e-ddb085bc7aba',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to use or access any computer or device which is internet enabled without the prior approval of your supervising officer; and only for the purpose, and only at a specific location, as specified by that officer.',
    },
    {
      code: '2d67f68a-8adf-47a9-a68d-a6fc9f2c4556',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to delete the usage history on any internet enabled device or computer used and to allow such items to be inspected as required by the police or your supervising officer. Such inspection may include removal of the device for inspection and the installation of monitoring software.',
    },
    {
      code: '3932e5c9-4d21-4251-a747-ce6dc52dc9c0',
      category: 'Possession, ownership, control or inspection of specified items or documents',
      text: 'Not to own or possess a [SPECIFIED ITEM) without the prior approval of your supervising officer.',
    },
    {
      code: '2a93b784-b8cb-49ed-95e2-a0df60723cda',
      category: 'Disclosure of information',
      text: 'Provide your supervising officer with details (such as make, model, colour, registration) of any vehicle you own, hire for more than a short journey or have regular use of, prior to any journey taking place.',
    },
    {
      code: 'db2d7e24-b130-4c7e-a1bf-6bb5f3036c02',
      category: 'Disclosure of information',
      text: 'Notify your supervising officer of any developing intimate relationships with [WOMEN / MEN / WOMEN OR MEN].',
    },
    {
      code: 'c5e91330-748d-46f3-93f6-bbe5ea8324ce',
      category: 'Disclosure of information',
      text: 'Notify your supervising officer of any developing personal relationships, whether intimate or not, with any person you know or believe to be resident in a household containing children under the age of 18. This includes persons known to you prior to your time in custody with whom you are renewing or developing a personal relationship with.',
    },
    {
      code: '79ac033f-9d7a-4dab-8344-475106e58b71',
      category: 'Disclosure of information',
      text: 'To notify your supervising officer of the details of any passport that you possess (including passport number), and of any intention to apply for a new passport.',
    },
    {
      code: '8686a815-b7f0-43b6-9886-f01df6a48773',
      category: 'Disclosure of information',
      text: 'Provide your supervising officer with the details of any bank accounts to which you are a signatory and of any credit cards you possess. You must also notify your supervising officer when becoming a signatory to any new bank account or credit card, and provide the account/card details. This condition will be reviewed on a monthly basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    },
    {
      code: '0a370862-5426-49c1-b6d4-3d074d78a81a',
      category: 'Curfew arrangement',
      text: 'Confine yourself to an address approved by your supervising officer between the hours of [TIME] and [TIME] daily unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk that you present has reduced appropriately.',
    },
    {
      code: 'c2435d4a-20a0-47de-b080-e1e740d1514c',
      category: 'Curfew arrangement',
      text: 'Confine yourself to remain at [CURFEW ADDRESS] initially from [START OF CURFEW HOURS] until [END OF CURFEW HOURS] each day, and, thereafter, for such a period as may be reasonably notified to you by your supervising officer; and comply with such arrangements as may be reasonably put in place and notified to you by your supervising officer so as to allow for your whereabouts and your compliance with your curfew requirement be monitored (whether by electronic means involving your wearing an electronic tag or otherwise).',
    },
    {
      code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
      category: 'Freedom of movement',
      text: 'Not to enter the area of [CLEARLY SPECIFIED AREA], as defined by the attached map without the prior approval of your supervising officer.',
    },
    {
      code: '42f71b40-84cd-446d-8647-f00bbb6c079c',
      category: 'Freedom of movement',
      text: 'Not to enter [NAME/TYPE OF PREMISES / ADDRESS / ROAD] without the prior approval of your supervising officer.',
    },
    {
      code: 'c4a17002-88a3-43b4-b3f7-82ff476cb217',
      category: 'Freedom of movement',
      text: "Not to enter or remain in sight of any [CHILDREN'S PLAY AREA, SWIMMING BATHS, SCHOOL ETC] without the prior approval of your supervising officer.",
    },
    {
      code: 'bb401b88-2137-4154-be4a-5e05c168638a',
      category: 'Freedom of movement',
      text: 'On release to be escorted by police to Approved Premises.',
    },
    {
      code: '5d0416a9-a4ce-4b2c-8636-0b7abaa3680a',
      category: 'Freedom of movement',
      text: 'To only attend places of worship which have been previously agreed with your supervising officer.',
    },
    {
      code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
      category:
        'Supervision in the community by the supervising officer, or other responsible officer, or organisation',
      text: 'Report to staff at [NAME OF APPROVED PREMISES / POLICE STATION] at [TIME / DAILY], unless otherwise authorised by your supervising officer. This condition will be reviewed by your supervising officer on a [WEEKLY / MONTHLY / ETC] basis and may be amended or removed if it is felt that the level of risk you present has reduced appropriately.',
    },
    {
      code: '7a9ca3bb-922a-433a-9601-1e475c6c0095',
      category: 'Restriction of specified conduct or specified acts',
      text: 'Not to participate directly or indirectly in organising and/or contributing to any demonstration, meeting, gathering or website without the prior approval of your supervising officer. This condition will be reviewed on a monthly basis and may be amended or removed if your risk is assessed as having changed.',
    },
    {
      code: '86f8b3d6-be31-48b2-a29e-5cf662c95ad1',
      category: 'Extremism',
      text: 'Not to contact directly or indirectly any person whom you know or believe to have been charged or convicted of any extremist related offence, without the prior approval of your supervising officer.',
    },
    {
      code: '9785d8f8-31a9-4c32-a06d-eff049ecebcd',
      category: 'Extremism',
      text: 'Not to attend or organise any meetings or gatherings other than those convened solely for the purposes of worship without the prior approval of your supervising officer.',
    },
    {
      code: '9efba199-87d4-468e-a5a1-1c0945571afa',
      category: 'Extremism',
      text: 'Not to give or engage in the delivery of any lecture, talk, or sermon whether part of an act of worship or not, without the prior approval of your supervising officer.',
    },
    {
      code: '3d771cc6-b85f-47e4-9e13-75bfb80706f4',
      category: 'Extremism',
      text: 'Not to engage in any discussion or act to promote grooming or influencing of an individual or a group for the purpose of extremism or radicalisation.',
    },
    {
      code: 'e0421c22-1be7-4d06-aba7-3c17822b0c1c',
      category: 'Extremism',
      text: 'Not to have in your possession any printed or electronically recorded material or handwritten notes which contain encoded information or that promote the destruction of or hatred for any religious or ethnic group or that celebrates, justifies or promotes acts of violence, or that contain information about military or paramilitary technology, weapons, techniques or tactics without the prior approval of your supervising officer.',
    },
    {
      code: '1dc7ee29-df47-48a8-90b6-69e286692d8a',
      category: 'Polygraph',
      text: 'To comply with any instruction given by your supervising officer requiring you to attend polygraph testing. To participate in polygraph sessions and examinations as instructed by or under the authority of your supervising officer and to comply with any instruction given to you during a polygraph session by the person conducting the polygraph.',
    },
    {
      code: '322bb3f7-2ee1-46aa-ae1c-3f743efd4327',
      category: 'Drug testing',
      text: 'Attend [INSERT NAME AND ADDRESS], as reasonably required by your supervising officer, to give a sample of oral fluid / urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the condition of your licence requiring you to be of good behaviour.',
    },
    {
      code: 'b088cc98-0e83-4f70-aab8-270e755a45c9',
      category: 'Drug testing',
      text: 'Not to take any action that could hamper or frustrate the drug testing process.',
    },
    {
      code: 'fd129172-bdd3-4d97-a4a0-efd7b47a49d4',
      category: 'Electronic monitoring',
      text: 'Allow person(s) as designated by your supervising officer to install an electronic monitoring tag on you and access to install any associated equipment in your property, and for the purpose of ensuring that equipment is functioning correctly. You must not damage or tamper with these devices and ensure that the tag is charged, and report to your supervising officer and the EM provider immediately if the tag or the associated equipment are not working correctly. This will be for the purpose of monitoring your [INSERT TYPES OF CONDITIONS TO BE ELECTRONICALLY MONITORED HERE] licence condition(s) unless otherwise authorised by your supervising officer.',
    },
    {
      code: '524f2fd6-ad53-47dd-8edc-2161d3dd2ed4',
      category: 'Electronic monitoring',
      text: 'You will be subject to trail monitoring. Your whereabouts will be electronically monitored by GPS Satellite Tagging, ending on [INSERT END DATE], and you must cooperate with the monitoring as directed by your supervising officer unless otherwise authorised by your supervising officer. .',
    },
    {
      code: '86e6f2a9-bb60-40f8-9ac4-310ebc72ac2f',
      category: 'Electronic monitoring',
      text: 'You must stay at [approved address] between 5pm and midnight every day until your electronic tag is installed unless otherwise authorised by your supervising officer.',
    },
    {
      code: '599bdcae-d545-461c-b1a9-02cb3d4ba268',
      category: 'Electronic monitoring',
      text: 'You are subject to alcohol monitoring. Your alcohol intake will be electronically monitoring for a period of [INSERT TIMEFRAME AND END DATE], and you may not consume units of alcohol, unless otherwise permitted by your supervising officer.',
    },
  ],
}
