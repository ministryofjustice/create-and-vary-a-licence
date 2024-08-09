export type HdcFirstDayCurfewFromUntil = CurfewFromUntil

export type HdcWeeklyCurfewFromUntil = {
  monday: CurfewFromUntil
  tuesday: CurfewFromUntil
  wednesday: CurfewFromUntil
  thursday: CurfewFromUntil
  friday: CurfewFromUntil
  saturday: CurfewFromUntil
  sunday: CurfewFromUntil
}

export type HdcInfo = {
  curfewAddress: string
  firstDayCurfewTimes: HdcFirstDayCurfewFromUntil
  weeklyCurfewTimes: HdcWeeklyCurfewFromUntil
  prisonTelephone: string
  monitoringSupplierTelephone: string
}

type CurfewFromUntil = {
  from: string
  until: string
}
