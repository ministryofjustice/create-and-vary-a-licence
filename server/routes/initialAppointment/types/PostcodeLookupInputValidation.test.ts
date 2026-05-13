import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import PostcodeLookupInputValidation from './PostcodeLookupInputValidation'

describe('PostcodeLookupInputValidation', () => {
  it('should accept a search query up to 200 characters', async () => {
    const model = plainToInstance(PostcodeLookupInputValidation, {
      actionType: 'search',
      searchQuery: 'A'.repeat(200),
    })

    const errors = await validate(model)

    expect(errors).toHaveLength(0)
  })

  it('should reject a search query longer than 200 characters', async () => {
    const model = plainToInstance(PostcodeLookupInputValidation, {
      actionType: 'search',
      searchQuery: 'A'.repeat(201),
    })

    const errors = await validate(model)

    expect(errors).toHaveLength(1)
    expect(Object.values(errors[0].constraints || {})).toContain('Address must be 200 characters or less')
  })
})
