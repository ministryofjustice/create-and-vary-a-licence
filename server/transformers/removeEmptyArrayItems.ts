import { Transform } from 'class-transformer'

export default function RemoveEmptyArrayItems() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.filter(item => item && item.length > 0)
    }
    return value
  })
}
