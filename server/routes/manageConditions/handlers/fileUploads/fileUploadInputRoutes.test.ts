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
              data: [],
            },
          ],
        } as Licence
      })

      it('should call licence service to update the additional condition data', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'code1', id: 1, data: [] },
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

      it('should redirect to the policy callback function with query parameter if fromPolicyReview flag is true', async () => {
        req.query.fromPolicyReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads?fromPolicyReview=true'
        )
      })

      it('should redirect to the input page of the next map if it has a name and is in the upgrade journey to policy v3', async () => {
        req.query.fromPolicyReview = 'true'
        res.locals.licence = {
          version: '3.0',
          additionalLicenceConditions: [
            {
              id: 1,
              code: 'code1',
              data: [{ id: 1, field: 'outOfBoundArea', value: 'Area1' }],
            },
            {
              id: 2,
              code: 'code1',
              data: [{ id: 1, field: 'outOfBoundArea', value: 'Area1' }],
            },
            {
              id: 3,
              code: 'code1',
              data: [{ id: 1, field: 'outOfBoundArea', value: 'Area1' }],
            },
          ],
        } as Licence

        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          `/licence/create/id/1/additional-licence-conditions/condition/2?fromPolicyReview=true`
        )
      })

      it('should redirect to the policy callback function with query parameter if it has a name but is in the upgrade journey to policy v2.1', async () => {
        req.query.fromPolicyReview = 'true'
        res.locals.licence = {
          version: '2.1',
          additionalLicenceConditions: [
            {
              id: 1,
              code: 'code1',
              data: [{ id: 1, field: 'outOfBoundArea', value: 'Area1' }],
            },
            {
              id: 2,
              code: 'code1',
              data: [{ id: 1, field: 'outOfBoundArea', value: 'Area1' }],
            },
            {
              id: 3,
              code: 'code1',
              data: [{ id: 1, field: 'outOfBoundArea', value: 'Area1' }],
            },
          ],
        } as Licence

        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/code1/file-uploads?fromPolicyReview=true'
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
              data: [],
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
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text', data: [] },
          { outOfBoundFilename: 'test.txt' },
          { username: 'joebloggs' }
        )
      })

      it('does not upload file if no file present on request', async () => {
        const { file, ...reqWithoutFile } = req

        await handler.POST(reqWithoutFile as Request, res)
        expect(licenceService.uploadExclusionZoneFile).not.toHaveBeenCalledWith()
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text', data: [] },
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
              data: [],
            },
            {
              id: 2,
              code: 'code2',
              expandedText: 'more expanded text',
              data: [],
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
              data: [],
            },
          ],
        } as Licence
      })

      it('should call licence service to update the additional condition data', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'code1', id: 1, data: [] },
          {},
          { username: 'joebloggs' }
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
          '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true'
        )
      })

      it('should redirect to the policy callback function with query parameter if fromReview flag is true', async () => {
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
              data: [],
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
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text', data: [] },
          { outOfBoundFilename: 'test.txt' },
          { username: 'joebloggs' }
        )
      })

      it('does not upload file if no file present on request', async () => {
        const { file, ...reqWithoutFile } = req

        await handler.POST(reqWithoutFile as Request, res)
        expect(licenceService.uploadExclusionZoneFile).not.toHaveBeenCalledWith()
        expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
          '1',
          { code: 'outOfBoundsRegion', id: 1, expandedText: 'expanded text', data: [] },
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
              data: [],
            },
            {
              id: 2,
              code: 'code2',
              expandedText: 'more expanded text',
              data: [],
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
