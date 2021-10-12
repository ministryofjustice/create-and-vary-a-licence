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
  additionalConditions: [
    {
      id: 'placeOfResidence',
      groupName: 'Residence at a specific place',
      text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
      inputTemplate: 'placeOfResidence',
    },
    {
      id: 'attendAppointments',
      groupName: 'Making or maintaining contact with a person',
      text: 'Attend all appointments arranged for you with a psychiatrist / psychologist / medical practitioner.',
    },
  ],
}
