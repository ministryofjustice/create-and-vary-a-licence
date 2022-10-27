import { Request, Response } from 'express'

import AdditionalLicenceConditionInputRoutes from './additionalLicenceConditionInput'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, conditionService) as jest.Mocked<LicenceService>
const conditionsProviderSpy = jest.spyOn(conditionService, 'getAdditionalConditionByCode')

describe('Route Handlers - Create Licence - Additional Licence Condition Input', () => {
  const handler = new AdditionalLicenceConditionInputRoutes(licenceService, conditionService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        conditionId: '1',
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
          additionalLicenceConditions: [],
          version: 'version',
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
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

    it('should render view with the additional condition and its config', async () => {
      // conditionService.getAdditionalConditionByCode = jest.fn()
      conditionsProviderSpy.mockResolvedValue({
        text: 'Condition 1',
        code: 'code1',
        inputs: [],
        category: 'category',
        requiresInput: false,
      })

      req.query.fromReview = 'true'

      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
        version: 'version',
      }

      await handler.GET(req, res)
      expect(conditionsProviderSpy).toHaveBeenCalledWith('code1', 'version')
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalLicenceConditionInput', {
        additionalCondition: {
          id: 1,
          code: 'code1',
        },
        config: {
          text: 'Condition 1',
          code: 'code1',
          inputs: [],
          category: 'category',
          requiresInput: false,
        },
      })
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditionData = jest.fn()
      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      }
    })

    it('should call licence service to update the additional condition data', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        { code: 'code1', id: 1 },
        {},
        { username: 'joebloggs' }
      )
    })

    it('should redirect to the callback function', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true'
      )
    })
  })

  describe('POST with file upload', () => {
    beforeEach(() => {
      const uploadFile = {
        path: 'test-file',
        originalname: 'test.txt',
        fieldname: 'outOfBoundFilename',
        mimetype: 'application/pdf',
        size: 100,
      } as Express.Multer.File

      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        file: uploadFile,
        query: {},
        body: { outOfBoundFilename: 'test.txt' },
      } as unknown as Request

      licenceService.uploadExclusionZoneFile = jest.fn()
      licenceService.updateAdditionalConditionData = jest.fn()

      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'outOfBoundsRegion',
            expandedText: 'expanded text',
          },
        ],
      }
    })

    it('should recognise a file upload', async () => {
      await handler.POST(req, res)
      expect(licenceService.uploadExclusionZoneFile).toHaveBeenCalledWith('1', '1', req.file, { username: 'joebloggs' })
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text' },
        { outOfBoundFilename: 'test.txt' },
        { username: 'joebloggs' }
      )
    })

    it('should ignore file uploads with for conditions other than out of bounds', async () => {
      req.file = { ...req.file, fieldname: 'WRONG' }
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text' },
        { outOfBoundFilename: 'test.txt' },
        { username: 'joebloggs' }
      )
      expect(licenceService.uploadExclusionZoneFile).not.toHaveBeenCalled()
    })
  })

  describe('DELETE', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditions = jest.fn()
      licenceService.deleteAdditionalCondition = jest.fn()
      res.locals.licence = {
        id: 1,
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
            expandedText: 'expanded text',
          },
          {
            id: 2,
            code: 'code2',
            expandedText: 'more expanded text',
          },
        ],
      }
    })

    it('should call licence service to update the additional conditions with the condition removed', async () => {
      await handler.DELETE(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledWith(1, 1, { username: 'joebloggs' })
    })

    it('should redirect to the callback function', async () => {
      await handler.DELETE(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.DELETE(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true'
      )
    })
  })
})
