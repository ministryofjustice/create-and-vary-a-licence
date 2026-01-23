import { IsNotEmpty, validate, ValidationError } from 'class-validator'
import { Expose, plainToInstance } from 'class-transformer'
import IsValidExclusionZoneFile from './IsValidZoneDefinitionFile'

class TestClass {
  @Expose()
  @IsNotEmpty({ message: 'Enter a value' })
  outOfBoundArea: string

  @Expose()
  @IsValidExclusionZoneFile()
  outOfBoundFilename: string
}

describe('File upload validation', () => {
  const MESSAGES = {
    REQUIRED_PDF: 'Select a PDF map',
    REQUIRED_VALUE: 'Enter a value',
    TOO_LARGE: 'The selected file must be smaller than 10MB',
  } as const

  const makeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
    ({
      path: 'test-file',
      originalname: 'test.pdf',
      size: 10,
      fieldname: 'filename',
      mimetype: 'application/pdf',
      ...overrides,
    }) as Express.Multer.File

  const makeValue = (overrides: Record<string, unknown> = {}) =>
    plainToInstance(
      TestClass,
      {
        outOfBoundArea: 'Somewhere',
        outOfBoundFilename: 'test.pdf',
        fileTargetField: 'outOfBoundFilename',
        ...overrides,
      },
      { exposeDefaultValues: true },
    )

  const expectNoErrors = (errors: ValidationError[]) => {
    expect(errors).toHaveLength(0)
  }

  const expectSingleErrorWithMessage = (errors: ValidationError[], constraintKey: string, message: string) => {
    expect(errors).toHaveLength(1)
    expect(errors[0].constraints).toEqual({
      [constraintKey]: message,
    })
  }

  describe('valid cases', () => {
    it('should pass for a normal file upload', async () => {
      const uploadFile = makeFile()
      const value = makeValue({
        outOfBoundFilename: uploadFile.originalname,
        uploadFile,
      })
      const errors = await validate(value)
      expectNoErrors(errors)
    })

    it('should pass when a filename already exists and area is not blank (no upload)', async () => {
      const value = makeValue({})
      const errors = await validate(value)
      expectNoErrors(errors)
    })
  })

  describe('invalid cases (user-fixable)', () => {
    it('should fail when area description is missing', async () => {
      const uploadFile = makeFile()
      const value = makeValue({
        outOfBoundArea: null,
        outOfBoundFilename: uploadFile.originalname,
        uploadFile,
      })
      const errors = await validate(value)
      expectSingleErrorWithMessage(errors, 'isNotEmpty', MESSAGES.REQUIRED_VALUE)
    })

    it('should fail when no file has been selected and no filename exists', async () => {
      const value = makeValue({
        outOfBoundFilename: undefined,
        uploadFile: undefined,
      })
      const errors = await validate(value)
      expectSingleErrorWithMessage(errors, 'isValidExclusionZoneFile', MESSAGES.REQUIRED_PDF)
    })

    it('should fail when an upload is attempted for an incorrect field name', async () => {
      const fileWithIncorrectField = makeFile({ fieldname: 'incorrect' })
      const value = makeValue({
        outOfBoundFilename: fileWithIncorrectField.originalname,
        uploadFile: fileWithIncorrectField,
      })
      const errors = await validate(value)
      expectSingleErrorWithMessage(errors, 'isValidExclusionZoneFile', MESSAGES.REQUIRED_PDF)
    })

    it('should fail when the upload file exceeds the maximum size limit', async () => {
      const bigFile = makeFile({ size: 99999999999 })
      const value = makeValue({
        outOfBoundFilename: bigFile.originalname,
        uploadFile: bigFile,
      })
      const errors = await validate(value)
      expectSingleErrorWithMessage(errors, 'isValidExclusionZoneFile', MESSAGES.TOO_LARGE)
    })
  })

  describe.each([
    {
      name: 'fails when mimetype is not application/pdf',
      fileOverrides: { mimetype: 'image/png' },
      expectedMessage: 'Select a PDF map',
    },
    {
      name: 'fails when originalname is blank',
      fileOverrides: { originalname: '' },
      expectedMessage: 'Select a PDF map',
    },
  ])('edge cases: $name', ({ fileOverrides, expectedMessage }) => {
    it('returns a single constraint error', async () => {
      const badFile = makeFile(fileOverrides as Partial<Express.Multer.File>)
      const value = makeValue({
        outOfBoundFilename: badFile.originalname || 'test.pdf',
        uploadFile: badFile,
      })
      const errors = await validate(value)
      expectSingleErrorWithMessage(errors, 'isValidExclusionZoneFile', expectedMessage)
    })
  })

  describe('security: unexpected logical filename should throw', () => {
    it('should throw for a disallowed logical filename (should never happen)', async () => {
      const uploadFile = makeFile()
      const value = makeValue({
        outOfBoundFilename: uploadFile.originalname,
        fileTargetField: 'incorrectFieldName',
        uploadFile,
      })

      try {
        await validate(value)
      } catch (e) {
        expect(e.message).toEqual('Unexpected filename value "incorrectFieldName"')
      }
    })
  })
})
