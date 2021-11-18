export default function hasAtLeastOne(value: string[]) {
  return value?.filter(v => v).length > 0
}
