import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import { isBlank } from '../utils/utils'

export default function IsValidRestrictionZoneFile(validationOptions?: ValidationOptions) {
  // Max exclusion file size in MB, this is configurable in licence API
  const MAX_FILE_SIZE_MB = 10

  const isValidRestrictionZoneFile = (inBoundFilename: string, { object }: ValidationArguments) => {
    const { uploadFile } = object as Record<string, Record<string, unknown>>
    // If there is a file upload present in the request then validate it
    if (uploadFile) {
      return (
        uploadFile.fieldname === 'inBoundFilename' &&
        uploadFile.originalname === inBoundFilename &&
        uploadFile.mimetype === 'application/pdf' &&
        (uploadFile.size as number) > 0 &&
        isValidSize(uploadFile)
      )
    }
    // If no file upload present (amend on other fields) just check there is a file name already present
    return !isBlank(inBoundFilename)
  }

  const isValidSize = (uploadFile: Record<string, unknown>): boolean => {
    const maxFileSizeInBytes = MAX_FILE_SIZE_MB * 1024 * 1024
    const fileSize = uploadFile.size as number
    return fileSize <= maxFileSizeInBytes
  }

  return (validatedObject: unknown, propertyName: string) => {
    registerDecorator({
      name: 'isValidRestrictionZoneFile',
      target: validatedObject.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: isValidRestrictionZoneFile,
        defaultMessage({ object }: ValidationArguments): string {
          const { uploadFile } = object as Record<string, Record<string, unknown>>
          if (uploadFile && !isValidSize(uploadFile)) {
            return 'The selected file must be smaller than 10MB'
          }
          return 'Select a PDF map'
        },
      },
    })
  }
}
