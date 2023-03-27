import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import _ from 'lodash'
import { isBlank } from '../utils/utils'

export default function IsValidExclusionZoneFile(validationOptions?: ValidationOptions) {
  const isValidExclusionZoneFile = (outOfBoundFilename: string, { object }: ValidationArguments) => {
    const { uploadFile } = object as Record<string, Record<string, unknown>>
    // If there is a file upload present in the request then validate it
    if (uploadFile) {
      return (
        uploadFile.fieldname === 'outOfBoundFilename' &&
        uploadFile.originalname === outOfBoundFilename &&
        uploadFile.mimetype === 'application/pdf' &&
        (uploadFile.size as number) > 0
      )
    }
    // If no file upload present (amend on other fields) just check there is a file name already present
    return !isBlank(outOfBoundFilename)
  }

  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'isValidExclusionZoneFile',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: isValidExclusionZoneFile },
    })
  }
}
