import { Request, Response } from 'express'
import { IsIn, IsNotEmpty, ValidateNested } from 'class-validator'
import { Expose, Type } from 'class-transformer'
import validationMiddleware from './validationMiddleware'

import IsValidZoneDefinitionFile from '../validators/IsValidZoneDefinitionFile'
import ConditionService from '../services/conditionService'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
jest.mock('../services/conditionService')

describe('validationMiddleware', () => {
  describe('middleware', () => {
    const res = { redirect: jest.fn(), locals: { licence: { version: 'version' } } } as unknown as Response
    let req = {} as Request

    const notEmptyMessage = 'not empty'
    const notValidMessage = 'not a valid selection'

    class DummyChild {
      @Expose()
      @IsNotEmpty({ message: notEmptyMessage })
      @IsIn(['valid'], { message: notValidMessage })
      name: string
    }

    class DummyForm {
      @Expose()
      @IsNotEmpty({ message: notEmptyMessage })
      id: string

      @Expose()
      @ValidateNested()
      @Type(() => DummyChild)
      child: DummyChild
    }

    class DummyFileUpload {
      @Expose()
      @IsNotEmpty({ message: notEmptyMessage })
      outOfBoundArea: string

      @Expose()
      @IsValidZoneDefinitionFile()
      outOfBoundFilename: string
    }

    class DummyAddress {
      @Expose()
      addressLine: string
    }

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should validate against a type from config if the form is an additional condition input', async () => {
      const additionalCondition = {
        text: 'Condition 1',
        code: 'condition1',
        requiresInput: true,
        validatorType: DummyChild,
        category: 'category',
      }

      conditionService.getAdditionalConditionByCode.mockResolvedValue(additionalCondition)

      const next = jest.fn()
      req = {
        params: {
          conditionId: '1',
        },
        get: (header: string) => {
          if (header === 'Referer') return '/validation-error-page'
          return undefined
        },
        flash: jest.fn(),
        body: {
          code: 'condition1',
          name: 'not valid',
        },
      } as unknown as Request

      await validationMiddleware(conditionService)(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([{ field: 'name', message: notValidMessage, summaryMessage: notValidMessage }]),
      )
      expect(req.flash).toHaveBeenCalledWith('formResponses', JSON.stringify(req.body))
    })

    it('should call next when there are no validation errors', async () => {
      const next = jest.fn()
      req = {
        params: {},
        body: {
          id: 'abc',
          child: { name: 'valid' },
        },
      } as Request

      await validationMiddleware(conditionService, DummyForm)(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should return flash responses', async () => {
      const next = jest.fn()
      req = {
        params: {},
        get: (header: string) => {
          if (header === 'Referer') return '/validation-error-page'
          return undefined
        },
        flash: jest.fn(),
        body: {
          id: '',
          child: { name: 'valid' },
        },
      } as unknown as Request

      await validationMiddleware(conditionService, DummyForm)(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([{ field: 'id', message: notEmptyMessage, summaryMessage: notEmptyMessage }]),
      )
      expect(req.flash).toHaveBeenCalledWith('formResponses', JSON.stringify(req.body))
    })

    it('should return the bottom level property on the error messages', async () => {
      const next = jest.fn()
      req = {
        params: {},
        get: (header: string) => {
          if (header === 'Referer') return '/validation-error-page'
          return undefined
        },
        flash: jest.fn(),
        body: {
          id: 'abc',
          child: { name: '' },
        },
      } as unknown as Request

      await validationMiddleware(conditionService, DummyForm)(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([{ field: 'name', message: notEmptyMessage, summaryMessage: notEmptyMessage }]),
      )
    })

    it('should validate a file upload', async () => {
      const next = jest.fn()

      const uploadFile = {
        path: 'test-file',
        originalname: 'test.txt',
        size: 10,
        fieldname: 'outOfBoundFilename',
        mimetype: 'application/pdf',
      } as Express.Multer.File

      req = {
        params: {},
        flash: jest.fn(),
        file: uploadFile,
        body: { outOfBoundArea: 'Anywhere' },
      } as unknown as Request

      await validationMiddleware(conditionService, DummyFileUpload)(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should validate that a field contains no markup', async () => {
      const next = jest.fn()

      req = {
        params: {},
        flash: jest.fn(),
        body: { addressLine: 'valid' },
      } as unknown as Request

      await validationMiddleware(conditionService, DummyAddress)(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should handle non validation errors', async () => {
      const next = jest.fn()

      conditionService.getAdditionalConditionByCode.mockRejectedValue('Error')

      req = {
        params: { nomisId: 'AB1234E' },
        body: { code: 'condition1' },
      } as unknown as Request

      await validationMiddleware(conditionService, DummyAddress)(req, res, next)
      expect(next).toHaveBeenCalledWith(
        new Error(`Failed to validate licence details for: ${req.params.nomisId}`, {
          cause: 'Error',
        }),
      )
    })

    it('should not call to retrieve condition data if none present in request', async () => {
      const next = jest.fn()

      req = {
        params: { nomisId: 'AB1234E' },
      } as unknown as Request

      await validationMiddleware(conditionService, DummyAddress)(req, res, next)
      expect(next).toHaveBeenCalledWith()
      expect(conditionService.getAdditionalConditionByCode).not.toHaveBeenCalled()
    })

    it('should handle redirection if no referer set to header', async () => {
      const next = jest.fn()
      req = {
        params: {},
        get: jest.fn().mockReturnValue(undefined),
        flash: jest.fn(),
        body: {
          id: 'abc',
          child: { name: '' },
        },
      } as unknown as Request

      await validationMiddleware(conditionService, DummyForm)(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('Missing Referer header'))
    })
  })
})
