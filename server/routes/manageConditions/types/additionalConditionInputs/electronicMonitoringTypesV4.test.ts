import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import ElectronicMonitoringTypesV4 from './electronicMonitoringTypesV4'

describe('ElectronicMonitoringTypesV4', () => {
  const validateEndDate = (day: string) => {
    const input = plainToInstance(ElectronicMonitoringTypesV4, {
      electronicMonitoringTypes: ['location'],
      endDate: { day, month: '08', year: '2027' },
    })

    Object.assign(input, {
      licence: {
        earliestReleaseDate: '18/08/2027',
        licenceExpiryDate: '31/08/2027',
      },
    })

    return validate(input)
  }

  it('rejects an end date earlier than 3 working days before release', async () => {
    const errors: ValidationError[] = await validateEndDate('17')

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            DateIsAfterExpectedReleaseDate: 'End date cannot be more than 3 working days before release',
          }),
        }),
      ]),
    )
  })

  it('rejects a null end date with the 3 working days before release error', async () => {
    const input = plainToInstance(ElectronicMonitoringTypesV4, {
      electronicMonitoringTypes: ['location'],
      endDate: { day: null, month: null, year: null },
    })

    Object.assign(input, {
      licence: {
        earliestReleaseDate: '18/08/2027',
        licenceExpiryDate: '31/08/2027',
      },
    })

    const errors: ValidationError[] = await validate(input)

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            DateIsAfterExpectedReleaseDate: 'End date cannot be more than 3 working days before release',
          }),
        }),
      ]),
    )
  })

  it('accepts an end date exactly 3 working days before release', async () => {
    const errors: ValidationError[] = await validateEndDate('18')

    expect(errors).toHaveLength(0)
  })
})
