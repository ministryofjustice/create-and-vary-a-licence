import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import AlcoholMonitoringPeriod from './alcoholMonitoringPeriod'

describe('AlcoholMonitoringPeriod', () => {
  const validateEndDate = (day: string, month = '08') => {
    const input = plainToInstance(AlcoholMonitoringPeriod, {
      timeframe: 'Until licence expiry',
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
            dateIsStrictlyAfter:
              'Enter a date that is after their release. Choose to skip this step if the end date has not been confirmed',
          }),
        }),
      ]),
    )
  })

  it('rejects an end date on the release date', async () => {
    const errors: ValidationError[] = await validateEndDate('18')

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            dateIsStrictlyAfter:
              'Enter a date that is after their release. Choose to skip this step if the end date has not been confirmed',
          }),
        }),
      ]),
    )
  })

  it('accepts an end date after release and on the licence expiry date', async () => {
    const errors: ValidationError[] = await validateEndDate('31')

    expect(errors).toHaveLength(0)
  })

  it('rejects an end date after the licence expiry date', async () => {
    const errors: ValidationError[] = await validateEndDate('01', '09')

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
    const input = plainToInstance(AlcoholMonitoringPeriod, {
      timeframe: 'Until licence expiry',
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

  it('shows an error when the timeframe is missing', async () => {
    const input = plainToInstance(AlcoholMonitoringPeriod, {
      endDate: { day: '31', month: '08', year: '2027' },
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
            isNotEmpty: 'Enter a timeframe',
          }),
        }),
      ]),
    )
  })
})
