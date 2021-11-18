import hasAtLeastOne from './hasAtLeastOne'

describe('hasAtLeastOne', () => {
  it('should return false if the field being validated is an empty array', () => {
    const value: string[] = []
    const result = hasAtLeastOne(value)

    expect(result).toBe(false)
  })

  it('should return false if the field being validated is null', () => {
    const value: string[] = null
    const result = hasAtLeastOne(value)

    expect(result).toBe(false)
  })

  it('should return false if the field being validated is an array of nulls', () => {
    const value: string[] = [null, null]
    const result = hasAtLeastOne(value)

    expect(result).toBe(false)
  })

  it('should return false if the field being validated is an array of empty strings', () => {
    const value: string[] = ['', '']
    const result = hasAtLeastOne(value)

    expect(result).toBe(false)
  })

  it('should return true if the field being validated is an array with at least one non empty string', () => {
    const value: string[] = ['', 'test']
    const result = hasAtLeastOne(value)

    expect(result).toBe(true)
  })
})
