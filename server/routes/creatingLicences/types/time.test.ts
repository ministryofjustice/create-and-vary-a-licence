import SimpleTime, { AmPm } from './time'

describe('fromString', () => {
  it('should return undefined if value is empty', () => {
    expect(SimpleTime.fromString('')).toBeUndefined()
  })

  it('should parse time string to SimpleTime', () => {
    const simpleTime = SimpleTime.fromString('02:30 pm')

    expect(simpleTime.hour).toBe('02')
    expect(simpleTime.minute).toBe('30')
    expect(simpleTime.ampm).toBe(AmPm.PM)
  })
})

describe('from24HourString', () => {
  it('should return undefined if value is empty', () => {
    expect(SimpleTime.from24HourString('')).toBeUndefined()
  })

  it('should parse 24 hour time string to SimpleTime', () => {
    const simpleTime = SimpleTime.from24HourString('14:30:00')

    expect(simpleTime.hour).toBe('02')
    expect(simpleTime.minute).toBe('30')
    expect(simpleTime.ampm).toBe(AmPm.PM)
  })
})
