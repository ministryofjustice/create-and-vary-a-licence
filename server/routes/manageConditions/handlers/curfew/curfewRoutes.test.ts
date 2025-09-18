import { Request, Response } from 'express'
import ConditionService from '../../../../services/conditionService'
import LicenceService from '../../../../services/licenceService'
import CurfewRoutes from './curfewRoutes'
import { SimpleTime } from '../../types'
import { CURFEW_CONDITION_CODE } from '../../../../utils/conditionRoutes'
import { AdditionalCondition } from '../../../../@types/licenceApiClientTypes'
import LicenceType from '../../../../enumeration/licenceType'

jest.mock('../../../../services/licenceService')
jest.mock('../../../../services/conditionService')

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>

describe('Route handlers - Curfew routes', () => {
  const handler = new CurfewRoutes(licenceService, conditionService)
  const conditionConfig = {
    code: CURFEW_CONDITION_CODE,
    text: 'Conditon 1',
    category: 'group1',
    tpl: 'Condition 1',
    requiresInput: true,
  }

  const curfewInstance1 = {
    id: 1,
    code: CURFEW_CONDITION_CODE,
    data: [
      {
        id: 1,
        field: 'numberOfCurfews',
        value: 'Two curfews',
        sequence: 0,
      },
      {
        id: 2,
        field: 'curfewStart',
        value: '01:00 am',
        sequence: 1,
      },
      {
        id: 3,
        field: 'curfewEnd',
        value: '02:00 am',
        sequence: 2,
      },
      {
        id: 4,
        field: 'reviewPeriod',
        value: 'weekly',
        sequence: 3,
      },
    ],
  }
  const curfewInstance2 = {
    id: 2,
    code: CURFEW_CONDITION_CODE,
    data: [
      {
        id: 1,
        field: 'numberOfCurfews',
        value: 'Two curfews',
        sequence: 0,
      },
      {
        id: 2,
        field: 'curfewStart',
        value: '04:00 am',
        sequence: 1,
      },
      {
        id: 3,
        field: 'curfewEnd',
        value: '05:00 am',
        sequence: 2,
      },
      {
        id: 4,
        field: 'reviewPeriod',
        value: 'weekly',
        sequence: 3,
      },
    ],
  }

  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        conditionCode: CURFEW_CONDITION_CODE,
      },
      query: {},
      body: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          id: 1,
          additionalLicenceConditions: [],
          version: 'version',
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response

    conditionService.getAdditionalConditionByCode.mockResolvedValue(conditionConfig)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should redirect to additional conditions list page if the additional condition is not found on the licence', async () => {
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions')
    })

    it('should redirect to additional conditions list page with fromReviewFlag if the additional condition is not found on the licence', async () => {
      req.query.fromReview = 'true'
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions?fromReview=true')
    })

    it('should format multiple instances of the condition into a single set of form values', async () => {
      res.locals.licence.additionalLicenceConditions = [curfewInstance1, curfewInstance2] as AdditionalCondition[]

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/curfew/input', {
        additionalConditionCode: curfewInstance1.code,
        reviewPeriod: 'weekly',
        alternativeReviewPeriod: null,
        numberOfCurfews: 'Two curfews',
        curfewTimes: {
          twoCurfewStart: SimpleTime.fromString('01:00 am'),
          twoCurfewEnd: SimpleTime.fromString('02:00 am'),
          twoCurfewStart2: SimpleTime.fromString('04:00 am'),
          twoCurfewEnd2: SimpleTime.fromString('05:00 am'),
        },
        config: conditionConfig,
      })
    })
  })

  describe('POST', () => {
    it('deletes any existing versions of the curfew condtion', async () => {
      await handler.POST(req, res)

      expect(licenceService.deleteAdditionalConditionsByCode).toHaveBeenCalledWith(
        [CURFEW_CONDITION_CODE],
        res.locals.licence.id,
        res.locals.user,
      )
    })

    it('adds a number of instances of the curfew condition equal to the user-selection', async () => {
      req.body = { numberOfCurfews: 'Three curfews' }

      await handler.POST(req, res)

      expect(licenceService.addAdditionalCondition).toHaveBeenCalledTimes(3)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledTimes(3)
    })

    it('should redirect to the callback function', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true',
      )
    })
  })

  describe('addCurfewCondition', () => {
    beforeEach(() => {
      conditionService.getAdditionalConditionType.mockResolvedValue(LicenceType.AP)
      conditionService.currentOrNextSequenceForCondition.mockReturnValue(0)
    })

    const inputs = {
      numberOfCurfews: 'Two curfews',
      curfewStart: SimpleTime.fromString('01:00 am'),
      curfewEnd: SimpleTime.fromString('02:00 am'),
      reviewPeriod: 'monthly',
      numberOfCurfews2: 'Two curfews',
      curfewStart2: SimpleTime.fromString('03:00 am'),
      curfewEnd2: SimpleTime.fromString('04:00 am'),
      reviewPeriod2: 'monthly',
      alternativeReviewPeriod: '',
    }

    it('adds an instance of the curfew condition to the licence', async () => {
      const request = {
        conditionCode: CURFEW_CONDITION_CODE,
        conditionCategory: conditionConfig.category,
        conditionText: conditionConfig.text,
        conditionType: 'AP',
        expandedText: 'Condition 1',
        sequence: 0,
      }

      await handler.addCurfewCondition(
        res.locals.licence,
        res.locals.user,
        CURFEW_CONDITION_CODE,
        inputs.curfewStart2,
        inputs.curfewEnd2,
        inputs.numberOfCurfews,
        inputs.reviewPeriod,
        inputs.alternativeReviewPeriod,
      )
      expect(licenceService.addAdditionalCondition).toHaveBeenCalledWith('1', 'AP', request, res.locals.user)
    })

    it('adds the submitted data to the additional conditions on the licence', async () => {
      const licenceCondition = { id: 1, code: CURFEW_CONDITION_CODE } as AdditionalCondition
      licenceService.addAdditionalCondition.mockResolvedValue(licenceCondition)

      const expectedSubmission = {
        numberOfCurfews: 'Two curfews',
        curfewStart: SimpleTime.fromString('03:00 am'),
        curfewEnd: SimpleTime.fromString('04:00 am'),
        reviewPeriod: 'monthly',
        alternativeReviewPeriod: null,
      } as Record<string, string | SimpleTime>

      await handler.addCurfewCondition(
        res.locals.licence,
        res.locals.user,
        CURFEW_CONDITION_CODE,
        inputs.curfewStart2,
        inputs.curfewEnd2,
        inputs.numberOfCurfews,
        inputs.reviewPeriod,
        inputs.alternativeReviewPeriod,
      )
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        licenceCondition,
        expectedSubmission,
        res.locals.user,
      )
    })
  })

  // describe('formatCurfewTimes', () => {
  //   it('should format one curfew correctly', () => {
  //     const input = {
  //       numberOfCurfews: 'One curfew',
  //       curfewStart: '08:00 am',
  //       curfewEnd: '06:00 pm',
  //     }

  //     const result = handler.formatCurfewTimes(input)

  //     expect(result).toEqual({
  //       oneCurfewStart: SimpleTime.fromString('08:00 am'),
  //       oneCurfewEnd: SimpleTime.fromString('06:00 pm'),
  //     })
  //   })

  //   it('should format two curfews correctly', () => {
  //     const input = {
  //       numberOfCurfews: 'Two curfews',
  //       curfewStart: '08:00 am',
  //       curfewEnd: '10:00 pm',
  //       curfewStart2: '02:00 pm',
  //       curfewEnd2: '04:00 pm',
  //     }

  //     const result = handler.formatCurfewTimes(input)

  //     expect(result).toEqual({
  //       twoCurfewStart: SimpleTime.fromString('08:00 am'),
  //       twoCurfewEnd: SimpleTime.fromString('10:00 pm'),
  //       twoCurfewStart2: SimpleTime.fromString('02:00 pm'),
  //       twoCurfewEnd2: SimpleTime.fromString('04:00 pm'),
  //     })
  //   })

  //   it('should format three curfews correctly', () => {
  //     const input = {
  //       numberOfCurfews: 'Three curfews',
  //       curfewStart: '06:00 am',
  //       curfewEnd: '08:00 am',
  //       curfewStart2: '12:00 pm',
  //       curfewEnd2: '02:00 pm',
  //       curfewStart3: '06:00 pm',
  //       curfewEnd3: '08:00 pm',
  //     }

  //     const result = handler.formatCurfewTimes(input)

  //     expect(result).toEqual({
  //       threeCurfewStart: SimpleTime.fromString('06:00 am'),
  //       threeCurfewEnd: SimpleTime.fromString('08:00 am'),
  //       threeCurfewStart2: SimpleTime.fromString('12:00 pm'),
  //       threeCurfewEnd2: SimpleTime.fromString('02:00 pm'),
  //       threeCurfewStart3: SimpleTime.fromString('06:00 pm'),
  //       threeCurfewEnd3: SimpleTime.fromString('08:00 pm'),
  //     })
  //   })

  //   it('should return null for unknown curfew type', () => {
  //     const input = {
  //       numberOfCurfews: 'Unknown',
  //       curfewStart: '08:00',
  //       curfewEnd: '18:00',
  //     }

  //     const result = handler.formatCurfewTimes(input)

  //     expect(result).toBeNull()
  //   })
  // })
})
