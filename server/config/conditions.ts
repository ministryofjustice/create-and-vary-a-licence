export default {
  standardConditions: [
    {
      text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period.',
    },
    {
      text: 'Not commit any offence.',
    },
    {
      text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer.',
    },
    {
      text: 'Receive visits from the supervising officer in accordance with instructions given by the supervising officer.',
    },
    {
      text: 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address.',
    },
    {
      text: 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work.',
    },
    {
      text: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal.',
    },
  ],
  additionalConditions: [
    {
      id: 'placeOfResidence',
      groupName: 'Residence at a specific place',
      text: 'You must reside within [INSERT REGION] while of no fixed abode, unless otherwise approved by your supervising officer.',
      inputTemplate: 'placeOfResidence',
    },
    {
      id: 'restrictionOfResidency',
      groupName: 'Restriction of residency',
      text: 'Not to reside (not even to stay for one night) in the same household as [ANY / ANY FEMALE / ANY MALE] child under the age of [INSERT AGE] without the prior approval of your supervising officer.',
    },
  ],
}
