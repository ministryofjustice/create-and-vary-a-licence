export type HdcCurfewAddress = {
  addressLineOne: string
  addressLineTwo: string
  addressTownOrCity: string
  addressPostcode: string
}

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

type CurfewFromUntil = {
  from: string
  until: string
}
