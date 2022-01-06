import { Request, Response } from 'express'

import AdditionalLicenceConditionInputRoutes from './additionalLicenceConditionInput'
import LicenceService from '../../../services/licenceService'
import * as conditionsProvider from '../../../utils/conditionsProvider'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const conditionsProviderSpy = jest.spyOn(conditionsProvider, 'getAdditionalConditionByCode')

describe('Route Handlers - Create Licence - Additional Licence Condition Input', () => {
  const handler = new AdditionalLicenceConditionInputRoutes(licenceService)
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
      conditionsProviderSpy.mockReturnValue({
        inputs: [],
      })

      req.query.fromReview = 'true'

      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      }

      await handler.GET(req, res)
      expect(conditionsProviderSpy).toHaveBeenCalledWith('code1')
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalLicenceConditionInput', {
        additionalCondition: {
          id: 1,
          code: 'code1',
        },
        config: {
          inputs: [],
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
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith('1', '1', {}, { username: 'joebloggs' })
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
          },
        ],
      }
    })

    it('should recognise a file upload', async () => {
      await handler.POST(req, res)
      expect(licenceService.uploadExclusionZoneFile).toHaveBeenCalledWith('1', '1', req.file, { username: 'joebloggs' })
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        '1',
        { outOfBoundFilename: 'test.txt' },
        { username: 'joebloggs' }
      )
    })

    it('should ignore file uploads with for conditions other than out of bounds', async () => {
      req.file = { ...req.file, fieldname: 'WRONG' }
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        '1',
        { outOfBoundFilename: 'test.txt' },
        { username: 'joebloggs' }
      )
      expect(licenceService.uploadExclusionZoneFile).not.toHaveBeenCalled()
    })
  })

  describe('DELETE', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditions = jest.fn()
      res.locals.licence = {
        id: 1,
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
          },
          {
            id: 2,
            code: 'code2',
          },
        ],
      }
    })

    it('should call licence service to update the additional conditions with the condition removed', async () => {
      await handler.DELETE(req, res)
      expect(licenceService.updateAdditionalConditions).toHaveBeenCalledWith(
        1,
        'AP',
        {
          additionalConditions: ['code2'],
        },
        { username: 'joebloggs' }
      )
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
