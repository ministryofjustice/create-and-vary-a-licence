import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import SimpleDate from '../routes/creatingLicences/types/date'
import DateIsBeforeLicenceExpiryOrTused from './dateIsBeforeLicenceExpiryOrTused'

class TestClass {
  @DateIsBeforeLicenceExpiryOrTused({ message: 'Date must be before the given date' })
  value: SimpleDate
}

describe('dateIsBeforeLicenceExpiryOrTused', () => {
  it('should fail validation if the date being validated is after the licence expiry date of an AP licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('22', '03', '2021'),
      licence: { typeCode: 'AP', licenceExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      dateIsBeforeLicenceExpiryOrTused: 'Date must be before the given date',
    })
  })

  it('should fail validation if the date being validated is after the licence expiry date of an AP_PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('22', '03', '2021'),
      licence: { typeCode: 'AP_PSS', licenceExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      dateIsBeforeLicenceExpiryOrTused: 'Date must be before the given date',
    })
  })

  it('should fail validation if the date being validated is after the TUSED of a PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('22', '03', '2021'),
      licence: { typeCode: 'PSS', topupSupervisionExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(1)
    expect(errors[0].constraints).toEqual({
      dateIsBeforeLicenceExpiryOrTused: 'Date must be before the given date',
    })
  })

  it('should pass validation if the date being validated is equal to the LED of an AP licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('02', '02', '2020'),
      licence: { typeCode: 'AP', licenceExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should pass validation if the date being validated is equal to the LED of an AP_PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('02', '02', '2020'),
      licence: { typeCode: 'AP_PSS', licenceExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should pass validation if the date being validated is equal to the TUSED of a PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('02', '02', '2020'),
      licence: { typeCode: 'PSS', topupSupervisionExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should pass validation if the date being validated is equal to the LED of an AP licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('23', '03', '2019'),
      licence: { typeCode: 'AP', licenceExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should pass validation if the date being validated is equal to the LED of an AP_PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('23', '03', '2019'),
      licence: { typeCode: 'AP_PSS', licenceExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should pass validation if the date being validated is equal to the TUSED of a PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('23', '03', '2019'),
      licence: { typeCode: 'PSS', topupSupervisionExpiryDate: '02/02/2020' },
    })
    const errors: ValidationError[] = await validate(value)

    expect(errors.length).toBe(0)
  })

  it('should throw an error if the LED is missing from an AP licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('23', '03', '2019'),
      licence: { typeCode: 'AP', licenceExpiryDate: null },
    })

    try {
      await validate(value)
    } catch (e) {
      expect(e.message).toEqual('Date to compare is not in a valid date format: licence.licenceExpiryDate - null')
    }
  })

  it('should throw an error if the LED is missing from an AP_PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('23', '03', '2019'),
      licence: { typeCode: 'AP_PSS', licenceExpiryDate: null },
    })

    try {
      await validate(value)
    } catch (e) {
      expect(e.message).toEqual('Date to compare is not in a valid date format: licence.licenceExpiryDate - null')
    }
  })

  it('should throw an error if the TUSED is missing from a PSS licence', async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('23', '03', '2019'),
      licence: { typeCode: 'PSS', topupSupervisionExpiryDate: null },
    })

    try {
      await validate(value)
    } catch (e) {
      expect(e.message).toEqual(
        'Date to compare is not in a valid date format: licence.topupSupervisionExpiryDate - null',
      )
    }
  })

  it("should throw an error if the type code isn't recognised", async () => {
    const value = plainToInstance(TestClass, {
      value: new SimpleDate('23', '03', '2019'),
      licence: { typeCode: 'abc', topupSupervisionExpiryDate: null },
    })

    try {
      await validate(value)
    } catch (e) {
      expect(e.message).toEqual('Unable to find LED or TUSED for dateIsBeforeLicenceExpiryOrTused comparison')
    }
  })
})
