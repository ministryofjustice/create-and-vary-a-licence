import fs from 'fs'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import LicenceKind from '../../../enumeration/LicenceKind'
import config from '../../../config'

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

  const existingConfig = { ...config }

  beforeEach(() => {
    config.hdcEnabled = true
  })

  afterEach(() => {
    jest.resetAllMocks()
    config.hdcEnabled = existingConfig.hdcEnabled
  })

  it('should not render the HDC curfew details for non HDC licences', () => {
    const $ = render({
      licence: { ...licence, kind: 'CRD' },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(0)
  })

  it('should not display vary buttons for a HDC licence if hdcEnabled is false', () => {
    config.hdcEnabled = false
    const { hdcEnabled } = config
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP',
        isInPssPeriod: false,
        isActivatedInPssPeriod: true,
        statusCode: LicenceStatus.ACTIVE,
        kind: LicenceKind.HDC,
      },
      hdcEnabled,
      callToActions: { shouldShowVaryButton: true },
    })
    expect($('[data-qa="vary-licence"]').length).toBe(0)
  })

  it('should display vary buttons for a HDC licence if hdcEnabled is true', () => {
    config.hdcEnabled = true
    const { hdcEnabled } = config
    const $ = render({
      licence: {
        ...licence,
        typeCode: 'AP',
        isInPssPeriod: false,
        isActivatedInPssPeriod: true,
        statusCode: LicenceStatus.ACTIVE,
        kind: LicenceKind.HDC,
      },
      hdcEnabled,
      callToActions: { shouldShowVaryButton: true },
    })
    expect($('[data-qa="vary-licence"]').length).toBe(2)
  })

  it('should render the HDC curfew details if the licence kind is HDC', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC' },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
  })

  it('should render the HDC curfew details if the licence kind is HDC_VARIATION', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC_VARIATION' },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
  })

  it('should render the curfew time summary if all the curfew times are equal', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC', allCurfewTimesEqual: true },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
    expect($('.all-curfew-times-equal').length).toBe(1)
  })

  it('should render the individual curfew times if any of the curfew times are different', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC' },
      hdcLicenceData: { allCurfewTimesEqual: false },
    })

    expect($('[data-qa=hdc-curfew-details]').length).toBe(1)
    expect($('[data-qa=curfew-times-not-equal]').length).toBe(1)
  })

  it('should not render Calculate release date label', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC', homeDetentionCurfewActualDate: '06/12/2026' },
      hdcLicenceData: { allCurfewTimesEqual: false },
    })

    expect($('.hdcad').text()).not.toMatch('CALCULATE RELEASE DATES')
  })

  it('should notrender HDC label', () => {
    const $ = render({
      licence: { ...licence, kind: 'HDC' },
      hdcLicenceData: { allCurfewTimesEqual: false },
    })

    expect($('.curfew-address').text()).not.toMatch('HDC')
  })
})
