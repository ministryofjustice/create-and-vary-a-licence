import fs from 'fs'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import LicenceKind from '../../../enumeration/LicenceKind'

const render = templateRenderer(fs.readFileSync('server/views/pages/vary/viewActive.njk').toString())

describe('ViewActive', () => {
  const licence = {
    id: 1,
    surname: 'Bobson',
    forename: 'Bob',
    statusCode: LicenceStatus.ACTIVE,
    appointmentTime: '12/12/2022 14:16',
    additionalLicenceConditions: [],
    additionalPssConditions: [],
    bespokeConditions: [],
  } as Licence

  const additionalConditionInputs = [
    [
      {
        text: 'Condition 1',
        requiresInput: false,
        code: 'CON1',
        data: {},
        uploadSummary: {},
      },
    ],
  ]

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should display expired section if licence type is AP_PSS, is in pss period, isActivatedInPssPeriod with additional conditions', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: true,
        isActivatedInPssPeriod: true,
      },
      additionalConditions: additionalConditionInputs,
    })
    expect($('#conditions-expired').text()).toBe('Conditions from expired licence')
  })

  it('should display expired section if licence type is AP_PSS, is in pss period, in variation with additional conditions', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: true,
        isActivatedInPssPeriod: false,
        statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
      },
      additionalConditions: additionalConditionInputs,
    })
    expect($('#conditions-expired').text()).toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is AP_PSS, is not in pss period, in variation with additional conditions', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: false,
        isActivatedInPssPeriod: false,
        statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
      },
      additionalConditions: additionalConditionInputs,
    })
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is AP_PSS, is in pss period, not in variation and not activated in pss period with additional conditions', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: false,
        isActivatedInPssPeriod: false,
        statusCode: LicenceStatus.ACTIVE,
      },
      additionalConditions: additionalConditionInputs,
    })
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is AP_PSS, is in pss period, not in variation and is activated in pss period with no additional conditions', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP_PSS',
        isInPssPeriod: false,
        isActivatedInPssPeriod: true,
        statusCode: LicenceStatus.ACTIVE,
      },
    })
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })

  it('should not display expired section if licence type is not AP_PSS, is in pss period, not in variation and is activated in pss period with additional conditions', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP',
        isInPssPeriod: false,
        isActivatedInPssPeriod: true,
        statusCode: LicenceStatus.ACTIVE,
      },
      additionalConditions: additionalConditionInputs,
    })
    expect($('#conditions-expired').text()).not.toBe('Conditions from expired licence')
  })

  it('should not display vary buttons for a HDC licence', () => {
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP',
        isInPssPeriod: false,
        isActivatedInPssPeriod: true,
        statusCode: LicenceStatus.ACTIVE,
        kind: LicenceKind.HDC,
      },
    })
    expect($('[data-qa="vary-licence"]').length).toBe(0)
  })
})
