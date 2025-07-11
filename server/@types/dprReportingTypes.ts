export type DprReportDefinition = {
  id: string
  name: string
  description: string
  variants: DprReportVariant[]
  authorised: boolean
}

export type DprReportVariant = {
  id: string
  name: string
  description: string
}
