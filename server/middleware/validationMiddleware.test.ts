// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata'
import { Request, Response } from 'express'
import { IsIn, IsNotEmpty, ValidateNested } from 'class-validator'
import { Expose, Type } from 'class-transformer'
import validationMiddleware from './validationMiddleware'

describe('validationMiddleware', () => {
  describe('middleware', () => {
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

    it('should call next when there are no validation errors', async () => {
      const next = jest.fn()
      const req = {
        body: {
          id: 'abc',
          child: { name: 'valid' },
        },
      } as Request
      const res = { redirect: jest.fn() } as unknown as Response
      await validationMiddleware(DummyForm)(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should return flash responses', async () => {
      const next = jest.fn()
      const req = {
        flash: jest.fn(),
        body: {
          id: '',
          child: { name: 'valid' },
        },
      } as unknown as Request
      const res = { redirect: jest.fn() } as unknown as Response
      await validationMiddleware(DummyForm)(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([{ field: 'id', message: notEmptyMessage }])
      )
      expect(req.flash).toHaveBeenCalledWith('formResponses', JSON.stringify(req.body))
    })

    it('should return the bottom level property on the error messages', async () => {
      const next = jest.fn()
      const req = {
        flash: jest.fn(),
        body: {
          id: 'abc',
          child: { name: '' },
        },
      } as unknown as Request
      const res = { redirect: jest.fn() } as unknown as Response
      await validationMiddleware(DummyForm)(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([{ field: 'name', message: notEmptyMessage }])
      )
    })
  })
})
