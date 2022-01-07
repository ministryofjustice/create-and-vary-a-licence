import { IsNotEmpty, validate, ValidationError } from 'class-validator'
import { Expose, plainToClass } from 'class-transformer'
import IsValidExclusionZoneFile from './isValidExclusionZoneFile'

class TestClass {
  @Expose()
  @IsNotEmpty({ message: 'Enter a value' })
  outOfBoundArea: string

  @Expose()
  @IsValidExclusionZoneFile({ message: 'Select a file' })
  outOfBoundFilename: string
}

describe('File upload validation', () => {
  const uploadFile = {
    path: 'test-file',
    originalname: 'test.txt',
    size: 10,
    fieldname: 'outOfBoundFilename',
    mimetype: 'application/pdf',
  } as Express.Multer.File

  it('should pass validation for a normal file upload', async () => {
    const value = plainToClass(TestClass, {
      outOfBoundArea: 'Somewhere',
      outOfBoundFilename: uploadFile.originalname,
      uploadFile,
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should pass validation when a filename already exists and area is not blank', async () => {
    const value = plainToClass(TestClass, { outOfBoundArea: 'Somewhere', outOfBoundFilename: 'test.pdf' })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(0)
  })

  it('should fail validation for a missing area description', async () => {
    const value = plainToClass(TestClass, {
      outOfBoundArea: null,
      outOfBoundFilename: uploadFile.originalname,
      uploadFile,
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      isNotEmpty: 'Enter a value',
    })
  })

  it('should fail validation when no file has been selected', async () => {
    const value = plainToClass(TestClass, { outOfBoundArea: 'Somewhere' })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      isValidExclusionZoneFile: 'Select a file',
    })
  })

  it('should fail validation when an upload is attempted for an incorrect field name', async () => {
    const fileWithIncorrectField = { ...uploadFile, fieldname: 'incorrect' }
    const value = plainToClass(TestClass, {
      outOfBoundArea: 'Somewhere',
      outOfBoundFilename: fileWithIncorrectField.originalname,
      uploadFile: fileWithIncorrectField,
    })
    const errors: ValidationError[] = await validate(value)
    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      isValidExclusionZoneFile: 'Select a file',
    })
  })
})
