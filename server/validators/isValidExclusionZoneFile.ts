import { registerDecorator, ValidationOptions } from 'class-validator'

export default function IsValidExclusionZoneFile(validationOptions?: ValidationOptions) {
  const isValidExclusionZoneFile = (uploadFile: Express.Multer.File) => {
    return (
      uploadFile &&
      uploadFile.fieldname === 'outOfBoundFilename' &&
      uploadFile.size > 0 &&
      uploadFile.mimetype === 'application/pdf'
    )
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
