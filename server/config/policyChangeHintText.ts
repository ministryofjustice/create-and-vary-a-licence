type HintText = { code: string; fromVersions: string[]; description: string[]; bulletpoints: string[] }

const policyChangeHints: HintText[] = [
  {
    code: 'a7c57e4e-30fe-4797-9fe7-70a35dbd7b65',
    fromVersions: ['1.0', '2.0'],
    description: ['Details of appointment time, date and location removed.'],
    bulletpoints: [],
  },
  {
    code: '89e656ec-77e8-4832-acc4-6ec05d3e9a98',
    fromVersions: ['1.0', '2.0'],
    description: ['Course and centre name removed.'],
    bulletpoints: [],
  },
  {
    code: 'db2d7e24-b130-4c7e-a1bf-6bb5f3036c02',
    fromVersions: ['1.0', '2.0'],
    description: [],
    bulletpoints: ['Details of relationship type removed', 'Requirement to report the ending of relationships added'],
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
    code: '680b3b27-43cc-46c6-9ba6-b10d4aba6531',
    fromVersions: ['1.0', '2.0'],
    description: ['Reference to supervising officer and police officer removed.'],
    bulletpoints: [],
  },
  {
    code: '2d67f68a-8adf-47a9-a68d-a6fc9f2c4556',
    fromVersions: ['1.0', '2.0'],
    description: ['Reference to supervising officer and police officer removed.'],
    bulletpoints: [],
  },
]

export default policyChangeHints
