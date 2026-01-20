import { Request, Response } from 'express'

import FileUploadInputRoutes from './fileUploadInputRoutes'
import LicenceService from '../../../../services/licenceService'
import type { Licence } from '../../../../@types/licenceApiClientTypes'
import FileUploadType from '../../../../enumeration/fileUploadType'

jest.mock('../../../../services/licenceService')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - file upload input routes', () => {
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
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('Multi-instance upload condition', () => {
    const handler = new FileUploadInputRoutes(licenceService, FileUploadType.MULTI_INSTANCE)
    describe('POST', () => {
      beforeEach(() => {
        licenceService.updateAdditionalConditionData = jest.fn()
        res.locals.licence = {
          version: '3.0',
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
          { username: 'joebloggs' },
        )
      })

      it('should redirect to the list view', async () => {
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads',
        )
      })

      it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads?fromReview=true',
        )
      })

      it('should redirect to the policy callback function with query parameter if fromPolicyReview flag is true', async () => {
        req.query.fromPolicyReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads?fromPolicyReview=true',
        )
      })

      it('should redirect to the input page of the next map if it is in the upgrade journey and has not already been updated to the latest version', async () => {
        req.query.fromPolicyReview = 'true'
        res.locals.licence = {
          additionalLicenceConditions: [
            {
              id: 1,
              code: 'code1',
              version: '3.0',
            },
            {
              id: 2,
              code: 'code1',
              version: '3.0',
            },
            {
              id: 3,
              code: 'code1',
              version: '3.0',
            },
          ],
        } as Licence

        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          `/licence/create/id/1/additional-licence-conditions/condition/2?fromPolicyReview=true`,
        )
      })

      it('should redirect to the policy callback function with query parameter if it is in the upgrade journey but has already been updated to the latest version', async () => {
        req.query.fromPolicyReview = 'true'
        res.locals.licence = {
          additionalLicenceConditions: [
            {
              id: 1,
              code: 'code1',
              version: '3.0',
            },
            {
              id: 2,
              code: 'code1',
              version: '3.0',
            },
            {
              id: 3,
              code: 'code1',
              version: '3.0',
            },
          ],
          version: '3.0',
        } as Licence

        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads?fromPolicyReview=true',
        )
      })
    })

    describe('POST with file upload', () => {
      beforeEach(() => {
        const uploadFile = {
          path: 'test-file',
          originalname: 'test.txt',
          fieldname: 'filename',
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
          body: { filename: 'test.txt', fileTargetField: 'outOfBoundFilename' },
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

      it('should recognise a outOfBounds file upload', async () => {
        await handler.POST(req, res)
        expect(licenceService.uploadExclusionZoneFile).toHaveBeenCalledWith('1', '1', req.file, {
          username: 'joebloggs',
        })
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text' },
          { outOfBoundFilename: 'test.txt' },
          { username: 'joebloggs' },
        )
      })

      it('should recognise a inBound file upload', async () => {
        req.body.fileTargetField = 'inBoundFilename'
        await handler.POST(req, res)
        expect(licenceService.uploadExclusionZoneFile).toHaveBeenCalledWith('1', '1', req.file, {
          username: 'joebloggs',
        })
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text' },
          { inBoundFilename: 'test.txt' },
          { username: 'joebloggs' },
        )
      })

      it('does not upload file if no file present on request', async () => {
        const { file, ...reqWithoutFile } = req

        await handler.POST(reqWithoutFile as Request, res)
        expect(licenceService.uploadExclusionZoneFile).not.toHaveBeenCalledWith()
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text' },
          { outOfBoundFilename: 'test.txt' },
          { username: 'joebloggs' },
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
          '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads',
        )
      })
    })
  })

  describe('Single-instance upload condition', () => {
    const handler = new FileUploadInputRoutes(licenceService, FileUploadType.SINGLE_INSTANCE)
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
          { username: 'joebloggs' },
        )
      })

      it('should redirect to the additional condition input callback', async () => {
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

      it('should redirect to the policy callback function with query parameter if fromReview flag is true', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true',
        )
      })
    })

    describe('POST with file upload', () => {
      beforeEach(() => {
        const uploadFile = {
          path: 'test-file',
          originalname: 'test.txt',
          fieldname: 'filename',
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
          body: { filename: 'test.txt', fileTargetField: 'outOfBoundFilename' },
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
        expect(licenceService.uploadExclusionZoneFile).toHaveBeenCalledWith('1', '1', req.file, {
          username: 'joebloggs',
        })
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text' },
          { outOfBoundFilename: 'test.txt' },
          { username: 'joebloggs' },
        )
      })

      it('does not upload file if no file present on request', async () => {
        const { file, ...reqWithoutFile } = req

        await handler.POST(reqWithoutFile as Request, res)
        expect(licenceService.uploadExclusionZoneFile).not.toHaveBeenCalledWith()
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text' },
          { outOfBoundFilename: 'test.txt' },
          { username: 'joebloggs' },
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

      it('should redirect to the additional condition input callback', async () => {
        await handler.DELETE(req, res)
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
      })
    })
  })
})
