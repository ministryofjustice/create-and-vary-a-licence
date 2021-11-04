import { ValidationArguments } from 'class-validator'
import isSimpleTimeAfter from './isSimpleTimeAfter'
import SimpleTime, { AmPm } from '../routes/creatingLicences/types/time'

describe('isSimpleTimeAfter', () => {
  it('should throw an exception if the field supplied for comparison is not an instance of SimpleTime', () => {
    const value = new SimpleTime('11', '00', <AmPm>'am')
    const fn = () =>
      isSimpleTimeAfter(value, {
        constraints: ['fieldForComparison'],
        object: {
          fieldForComparison: {},
        },
      } as ValidationArguments)

    expect(fn).toThrow('The field supplied for comparison was not of the required type i.e. SimpleTime')
  })

  it('should return true if the field being validated is a time after the field supplied for comparison', () => {
    const value = new SimpleTime('11', '00', <AmPm>'am')
    const result = isSimpleTimeAfter(value, {
      constraints: ['fieldForComparison'],
      object: {
        fieldForComparison: new SimpleTime('10', '00', <AmPm>'am'),
      },
    } as ValidationArguments)

    expect(result).toBe(true)
  })

  it('should return false if the field being validated is a time after the field supplied for comparison', () => {
    const value = new SimpleTime('10', '00', <AmPm>'am')
    const result = isSimpleTimeAfter(value, {
      constraints: ['fieldForComparison'],
      object: {
        fieldForComparison: new SimpleTime('11', '00', <AmPm>'am'),
      },
    } as ValidationArguments)

    expect(result).toBe(false)
  })
})
