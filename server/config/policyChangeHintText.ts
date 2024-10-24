type HintText = { code: string; fromVersions: string[]; description: string[]; bulletpoints: string[] }

const policyChangeHints: HintText[] = [
  {
    code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
    fromVersions: ['1.0', '2.0'],
    description: ['Details of appointment time, date and location removed.'],
    bulletpoints: [],
  },
  {
    code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
    fromVersions: ['2.1'],
    description: ['Requirement to select a substance this person needs support with added.'],
    bulletpoints: [],
  },
  {
    code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
    fromVersions: ['1.0', '2.0'],
    description: ['Course and centre name removed.'],
    bulletpoints: [],
  },
  {
    code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
    fromVersions: ['2.1'],
    description: [
      'If this person needs support with something not mentioned directly in the conditions below, you can:',
    ],
    bulletpoints: ['apply the first condition and then', 'select the “offending behaviour” option'],
  },
  {
    code: 'db2d7e24-b130-4c7e-a1bf-6bb5f3036c02',
    fromVersions: ['1.0', '2.0'],
    description: [],
    bulletpoints: ['Details of relationship type removed', 'Requirement to report the ending of relationships added'],
  },
  {
    code: 'db2d7e24-b130-4c7e-a1bf-6bb5f3036c02',
    fromVersions: ['2.1'],
    description: ['The description of which relationship changes should be reported is now more detailed.'],
    bulletpoints: [],
  },
  {
    code: 'c2435d4a-20a0-47de-b080-e1e740d1514c',
    fromVersions: ['1.0', '2.0'],
    description: [
      'The previous condition has been removed.',
      'If a curfew with electronic monitoring is required, you must select both of the conditions below. If a curfew only is required, choose the first condition.',
    ],
    bulletpoints: [],
  },
  {
    code: '599bdcae-d545-461c-b1a9-02cb3d4ba268',
    fromVersions: ['1.0', '2.0'],
    description: ['The previous condition has been split into 2:'],
    bulletpoints: [
      'Choose the first licence condition if this person must not drink any alcohol',
      'Choose the second licence condition if this person must limit how much they drink',
    ],
  },
  {
    code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
    fromVersions: ['1.0', '2.0'],
    description: [
      'The wording of this licence condition will stay the same.',
      'If you need to, you can now add more precise reporting times on the next page.',
    ],
    bulletpoints: [],
  },
  {
    code: '4673ebe4-9fc0-4e48-87c9-eb17d5280867',
    fromVersions: ['2.1'],
    description: ['Option to select “the Approved Premises where you reside” added.'],
    bulletpoints: [],
  },
  {
    code: '322bb3f7-2ee1-46aa-ae1c-3f743efd4327',
    fromVersions: ['1.0', '2.0'],
    description: [],
    bulletpoints: ['Details of test centre location removed', 'Requirement not to hamper testing process added'],
  },
  {
    code: '2027ae19-04a2-4fa6-8d1b-a62dffba2e62',
    fromVersions: ['1.0', '2.0'],
    description: [
      'The wording of this licence condition will stay the same.',
      'If you need to, you can now add more precise reporting times on the next page.',
    ],
    bulletpoints: [],
  },
  {
    code: '5db26ab3-9b6f-4bee-b2aa-53aa3f3be7dd',
    fromVersions: ['1.0', '2.0'],
    description: ['Requirement that the person stay in a probation region overnight added.'],
    bulletpoints: [],
  },
  {
    code: 'b72fdbf2-0dc9-4e7f-81e4-c2ccb5d1bc90',
    fromVersions: ['1.0', '2.0'],
    description: ['Requirement to select a psychiatrist, psychologist or medical practitioner removed.'],
    bulletpoints: [],
  },
  {
    code: 'b72fdbf2-0dc9-4e7f-81e4-c2ccb5d1bc90',
    fromVersions: ['2.1'],
    description: ['On the next page, you can choose which professionals the appointments will be with.'],
    bulletpoints: [],
  },
  {
    code: '680b3b27-43cc-46c6-9ba6-b10d4aba6531',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: [
      'The previous condition has been removed.',
      'If you still need this restriction, you can use the following licence condition.',
    ],
    bulletpoints: [],
  },
  {
    code: '2d67f68a-8adf-47a9-a68d-a6fc9f2c4556',
    fromVersions: ['1.0', '2.0'],
    description: ['Reference to supervising officer and police officer removed.'],
    bulletpoints: [],
  },
  {
    code: 'fce34fb2-02f4-4eb0-9b8d-d091e11451fa',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: [
      'The wording of this licence condition will stay the same.',
      'If you need to, you can set a more precise age restriction on the next page.',
    ],
    bulletpoints: [],
  },
  {
    code: '2d67f68a-8adf-47a9-a68d-a6fc9f2c4556',
    fromVersions: ['2.1'],
    description: ['You can now select which devices should be covered by this licence condition.'],
    bulletpoints: [],
  },
  {
    code: '4a5fed48-0fb9-4711-8ddf-b46ddfd90246',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: [
      'The wording of this licence condition will stay the same.',
      'If you need to, you can set a more precise age restriction on the next page.',
    ],
    bulletpoints: [],
  },
  {
    code: '9da214a3-c6ae-45e1-a465-12e22adf7c87',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: [
      'The wording of this licence condition will stay the same.',
      'If you need to, you can set a more precise age restriction on the next page.',
    ],
    bulletpoints: [],
  },
  {
    code: '72d281c3-b194-43ab-812d-fea0683ada65',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: [
      'The previous condition has been removed.',
      'If you still need this restriction, you can use the following licence condition. You can then specify that the item they cannot own is a mobile phone with a photographic function on the next screen.',
    ],
    bulletpoints: [],
  },
  {
    code: 'ed607a91-fe3a-4816-8eb9-b447c945935c',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: [
      'The previous condition has been removed.',
      'If you still need this restriction, you can use the following licence condition. You can then specify that the item they cannot own is a camera on the next screen.',
    ],
    bulletpoints: [],
  },
  {
    code: '8686a815-b7f0-43b6-9886-f01df6a48773',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: ['You can now choose which options to apply to this condition.'],
    bulletpoints: [],
  },
  {
    code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: ['You no longer need to provide a name for exclusion zones.'],
    bulletpoints: [],
  },
  {
    code: 'bb401b88-2137-4154-be4a-5e05c168638a',
    fromVersions: ['1.0', '2.0', '2.1'],
    description: [],
    bulletpoints: [],
  },
  {
    code: '42f71b40-84cd-446d-8647-f00bbb6c079c',
    fromVersions: ['1.0', '2.0'],
    description: [
      'The wording of this licence condition will stay the same.',
      'On the next page, you will need to choose from more specific options and then re-enter the information.',
    ],
    bulletpoints: [],
  },
]

export default policyChangeHints
