export type DprReportDefinition = {
  id: string
  name: string
  description: string
  variants: DprVariant[]
  authorised: boolean
}

export type DprVariant = {
  id: string
  name: string
  description: string
}
