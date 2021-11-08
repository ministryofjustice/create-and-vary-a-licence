import { Expose, plainToClass } from 'class-transformer'
import RemoveEmptyArrayItems from './removeEmptyArrayItems'

describe('Transformers - RemoveEmptyArrayItems', () => {
  class DummyForm {
    @Expose()
    @RemoveEmptyArrayItems()
    items: unknown[]
  }

  it('it should filter undefined array items', () => {
    const plainBody = {
      items: [undefined, 'test1', undefined],
    }

    const bodyAsClass = plainToClass(DummyForm, plainBody, { excludeExtraneousValues: true })

    expect(bodyAsClass.items).toStrictEqual(['test1'])
  })

  it('it should filter empty strings from array', () => {
    const plainBody = {
      items: ['', 'test1', ''],
    }

    const bodyAsClass = plainToClass(DummyForm, plainBody, { excludeExtraneousValues: true })

    expect(bodyAsClass.items).toStrictEqual(['test1'])
  })

  it('it should return value if not array', () => {
    const plainBody = {
      items: 'test1',
    }

    const bodyAsClass = plainToClass(DummyForm, plainBody, { excludeExtraneousValues: true })

    expect(bodyAsClass.items).toStrictEqual('test1')
  })
})
