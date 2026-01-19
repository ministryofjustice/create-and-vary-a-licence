import { validate, ValidationError } from 'class-validator'
import { Expose, plainToInstance } from 'class-transformer'
import IsValidRestrictionZoneFile from './isValidRestrictionZoneFile'

class TestClass {
  @Expose()
  @IsValidRestrictionZoneFile()
  inBoundFilename: string
}

describe('File upload validation', () => {
  const uploadFile = {
    path: 'test-file',
    originalname: 'test.txt',
    size: 10,
    fieldname: 'inBoundFilename',
    mimetype: 'application/pdf',
  } as Express.Multer.File

  it('should pass validation for a normal file upload', async () => {
    const value = plainToInstance(TestClass, {
      inBoundFilename: uploadFile.originalname,
      uploadFile,
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should pass validation when a filename already exists and area is not blank', async () => {
    const value = plainToInstance(TestClass, { inBoundFilename: 'test.pdf' })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should fail validation when no file has been selected', async () => {
    const value = plainToInstance(TestClass, {})
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      isValidRestrictionZoneFile: 'Select a PDF map',
    })
  })

  it('should fail validation when an upload is attempted for an incorrect field name', async () => {
    const fileWithIncorrectField = { ...uploadFile, fieldname: 'incorrect' }
    const value = plainToInstance(TestClass, {
      inBoundFilename: fileWithIncorrectField.originalname,
      uploadFile: fileWithIncorrectField,
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      isValidRestrictionZoneFile: 'Select a PDF map',
    })
  })

  it('should fail validation when the upload file exceeds the maximum size limit', async () => {
    const bigFile = { ...uploadFile, size: 99999999999, fieldname: 'incorrect' }
    const value = plainToInstance(TestClass, {
      inBoundFilename: bigFile.originalname,
      uploadFile: bigFile,
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      isValidRestrictionZoneFile: 'The selected file must be smaller than 10MB',
    })
  })
})
