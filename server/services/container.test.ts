import Container from './container'

describe('Container', () => {
  test('filter', () => {
    const filteredContainer = new Container(['a', 'bb', 'ccc']).filter(i => i.length >= 2, 'less than 2 chars')

    expect(filteredContainer).toStrictEqual(new Container(['bb', 'ccc'], [['a', 'less than 2 chars']]))
  })

  test('map', () => {
    expect(new Container(['a', 'bb', 'ccc']).map(i => i.length)).toStrictEqual(new Container([1, 2, 3]))
  })

  test('isEmpty', () => {
    expect(new Container(['1']).isEmpty()).toBeFalsy()
    expect(new Container([]).isEmpty()).toBeTruthy()
  })

  test('concat', () => {
    expect(new Container([]).concat(new Container([]))).toStrictEqual(new Container([]))
    expect(new Container(['1']).concat(new Container([]))).toStrictEqual(new Container(['1']))
    expect(new Container(['1']).concat(new Container(['2']))).toStrictEqual(new Container(['1', '2']))
    expect(new Container([]).concat(new Container(['2']))).toStrictEqual(new Container(['2']))

    expect(new Container(['1'], [['2', 'no good']]).concat(new Container(['2'], [['3', 'bad']]))).toStrictEqual(
      new Container(
        ['1', '2'],
        [
          ['2', 'no good'],
          ['3', 'bad'],
        ]
      )
    )
  })

  test('unwrap', () => {
    expect(new Container([]).unwrap()).toStrictEqual([])
    expect(new Container(['1']).unwrap()).toStrictEqual(['1'])
  })

  test('complex map/filter example', () => {
    const filteredContainer = new Container(['apple', 'ball', 'cat', 'dragon', 'elephants', 'balloon', 'elephants'])
      .filter(item => !item.startsWith('ba'), 'starts with ba')
      .map(item => item.toUpperCase())
      .filter((_, i) => i !== 3, 'at index 3')
      .filter(item => item.length > 3, '3 characters or less')
      .map(item => item.length)
      .filter(item => item !== 5, "is '5'")

    expect(filteredContainer).toStrictEqual(
      new Container(
        [6, 9],
        [
          ['ball', 'starts with ba'],
          ['balloon', 'starts with ba'],
          ['ELEPHANTS', 'at index 3'],
          ['CAT', '3 characters or less'],
          [5, "is '5'"],
        ]
      )
    )
  })

  test('immutable', () => {
    const filteredContainer = new Container(['aaa', 'bbbb'])

    const result1 = filteredContainer
      .map(item => item.toUpperCase())
      .filter(item => item.length > 3, '3 characters or less')

    const result2 = filteredContainer
      .map(item => item.toLowerCase())
      .filter(item => item.length < 4, 'more than 4 characters')

    expect(result1).toStrictEqual(new Container(['BBBB'], [['AAA', '3 characters or less']]))

    expect(result2).toStrictEqual(new Container(['aaa'], [['bbbb', 'more than 4 characters']]))
  })
})
