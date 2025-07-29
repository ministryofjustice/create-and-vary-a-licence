import SimpleDate from './date'

describe('SimpleDate.fromString', () => {
  it('should parse date with ordinal suffix (e.g., "23rd")', () => {
    const result = SimpleDate.fromString('Monday 23rd February 2026')
    expect(result).toEqual(new SimpleDate('23', '02', '2026'))
  })

  it('should parse date without ordinal suffix (e.g., "23")', () => {
    const result = SimpleDate.fromString('Monday 23 February 2026')
    expect(result).toEqual(new SimpleDate('23', '02', '2026'))
  })

  it('should parse date with "1st"', () => {
    const result = SimpleDate.fromString('Sunday 1st March 2026')
    expect(result).toEqual(new SimpleDate('01', '03', '2026'))
  })

  it('should return undefined for empty input', () => {
    const result = SimpleDate.fromString('')
    expect(result).toBeUndefined()
  })

  it('should return undefined for invalid date format', () => {
    const result = SimpleDate.fromString('23rd February 2026') // Missing weekday
    expect(result).toBeUndefined()
  })

  it('should return undefined for completely invalid string', () => {
    const result = SimpleDate.fromString('not a date')
    expect(result).toBeUndefined()
  })
})
