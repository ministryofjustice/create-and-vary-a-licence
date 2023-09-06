import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import FileUploadRemovalRoutes from './fileUploadRemovalRoutes'
import { MEZ_CONDITION_CODE } from '../../../../utils/conditionRoutes'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
describe('Route Handlers - Create Licence - File Upload Removal Routes Handler', () => {
  const handler = new FileUploadRemovalRoutes(licenceService)
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
          additionalLicenceConditions: [
            { id: 1, code: 'testCode', uploadSummary: [{ filename: 'testFile' }], data: [{ value: 'an area' }] },
          ],
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should display confirmation page to delete condition', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/fileUploads/confirmUploadDeletion', {
        conditionId: '1',
        conditionCode: 'testCode',
        displayMessage: null,
        description: 'an area',
        fileName: 'testFile',
      })
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.deleteAdditionalCondition = jest.fn()
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        status: jest.fn(),
        locals: {
          licence: {
            id: 1,
            additionalLicenceConditions: [
              { id: 1, code: MEZ_CONDITION_CODE, uploadSummary: [{ filename: 'testFile' }] },
            ],
          },
          user: {
            username: 'joebloggs',
          },
        },
      } as unknown as Response
    })

    it('should call delete condition for submitted conditionId', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: { confirmRemoval: 'Yes' },
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledWith(1, 1, { username: 'joebloggs' })
    })

    it('should redirect to the MEZ page', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: { confirmRemoval: 'Yes' },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        `/licence/create/id/1/additional-licence-conditions/condition/${MEZ_CONDITION_CODE}/file-uploads?fromReview=true`
      )
    })

    it('should not call delete condition for submitted conditionId', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: { confirmRemoval: 'No' },
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledTimes(0)
    })

    it('should display error if no option is selected', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: {},
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledTimes(0)
      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/fileUploads/confirmUploadDeletion', {
        conditionId: '1',
        conditionCode: MEZ_CONDITION_CODE,
        displayMessage: { text: 'Select yes or no' },
        fileName: 'testFile',
      })
    })
  })
})
