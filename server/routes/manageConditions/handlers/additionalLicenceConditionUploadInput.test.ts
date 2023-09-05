import { Request, Response } from 'express'

import AdditionalLicenceConditionUploadInputRoutes from './additionalLicenceConditionUploadInput'
import LicenceService from '../../../services/licenceService'
import type { Licence } from '../../../@types/licenceApiClientTypes'

jest.mock('../../../services/licenceService')

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Additional Licence Condition Input for upload areas', () => {
  const handler = new AdditionalLicenceConditionUploadInputRoutes(licenceService)
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
      } as Licence
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

    it('should redirect to the list view', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads'
      )
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads?fromReview=true'
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
      } as Licence
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
      } as Licence
    })

    it('should call licence service to update the additional conditions with the condition removed', async () => {
      await handler.DELETE(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledWith(1, 1, { username: 'joebloggs' })
    })

    it('should redirect to the area list view', async () => {
      await handler.DELETE(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads'
      )
    })
  })
})
