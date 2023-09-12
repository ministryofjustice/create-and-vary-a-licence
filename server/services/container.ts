type FilterParams<T> = (value: T, index: number, array: T[]) => unknown
type MapParams<T, R> = (t: T, index: number, array: T[]) => R
type ExcludedItem = [item: unknown, reason: string]

export default class Container<T> {
  constructor(
    private readonly items: T[],
    private readonly excludedItems: ExcludedItem[] = []
  ) {}

  filter(filterParams: FilterParams<T>, exclusionReason: string): Container<T> {
    const included: T[] = []
    const excluded = [...this.excludedItems]
    this.items.forEach((item, i, all) => {
      if (filterParams(item, i, all)) {
        included.push(item)
      } else {
        excluded.push([item, exclusionReason])
      }
    })
    return new Container(included, excluded)
  }

  map<R>(mapParams: MapParams<T, R>): Container<R> {
    return new Container(this.items.map(mapParams), [...this.excludedItems])
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  concat(other: Container<T>): Container<T> {
    return new Container(this.items.concat(other.items), this.excludedItems.concat(other.excludedItems))
  }

  unwrap(): T[] {
    return [...this.items]
  }

  exclusions(): ExcludedItem[] {
    return [...this.excludedItems]
  }
}
