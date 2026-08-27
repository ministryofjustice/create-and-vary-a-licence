import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import ElectronicMonitoringTypesV4 from './electronicMonitoringTypesV4'

describe('ElectronicMonitoringTypesV4', () => {
  const validateEndDate = (day: string, month = '08') => {
    const input = plainToInstance(ElectronicMonitoringTypesV4, {
      electronicMonitoringTypes: ['location'],
      endDate: { day, month, year: '2027' },
    })

    Object.assign(input, {
      licence: {
        licenceStartDate: '18/08/2027',
        licenceExpiryDate: '31/08/2027',
      },
    })

    return validate(input)
  }

  it('rejects an end date before release', async () => {
    const errors: ValidationError[] = await validateEndDate('17')

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            dateIsStrictlyAfter: 'Enter a date that is after their release',
          }),
        }),
      ]),
    )
  })

  it('rejects an end date on the release date', async () => {
    const errors = await validateEndDate('18')

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            dateIsStrictlyAfter: 'Enter a date that is after their release',
          }),
        }),
      ]),
    )
  })

  it('accepts an end date after release and on the licence expiry date', async () => {
    const errors = await validateEndDate('31')

    expect(errors).toHaveLength(0)
  })

  it('rejects an end date after the licence expiry date', async () => {
    const errors = await validateEndDate('01', '09')

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            dateIsBefore: 'The monitoring end date must be before the licence expiry date',
          }),
        }),
      ]),
    )
  })

  it('shows an enter a date error when the end date is missing', async () => {
    const input = plainToInstance(ElectronicMonitoringTypesV4, {
      electronicMonitoringTypes: ['location'],
      endDate: { day: '', month: '', year: '' },
    })

    Object.assign(input, {
      licence: {
        licenceStartDate: '18/08/2027',
        licenceExpiryDate: '31/08/2027',
      },
    })

    const errors: ValidationError[] = await validate(input)

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            ValidSimpleDate: 'Enter a date',
          }),
        }),
      ]),
    )
  })
})
