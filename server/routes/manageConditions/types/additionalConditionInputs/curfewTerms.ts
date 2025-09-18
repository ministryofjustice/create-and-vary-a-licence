import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import { CurfewTimeRange } from './curfewTimeRange'

export class CurfewTerms {
  @Expose()
  @IsNotEmpty({ message: 'Select a number of curfews' })
  numberOfCurfews: string

  // @Expose()
  // @Transform(({ obj, value }) => {
  //   const numberOfCurfews = parseInt(obj.numberOfCurfews, 10)
  //   const selected = value[numberOfCurfews - 1] ?? []
  //   // const curfews: CurfewTimeRange[] = []

  //   // selected.forEach((timeValue: CurfewTimeRange, index: number) => {
  //   //   const { start, end } = timeValue as CurfewTimeRange

  //   //   curfews.push({
  //   //     start,
  //   //     end,
  //   //     curfewIndex: numberOfCurfews,
  //   //     slotIndex: index,
  //   //   })
  //   // })

  //   const curfews: CurfewTimeRange[] = selected.map((timeValue: CurfewTimeRange, index: number) => {
  //     const instance = new CurfewTimeRange()
  //     instance.start = timeValue.start
  //     instance.end = timeValue.end
  //     instance.curfewIndex = numberOfCurfews
  //     instance.slotIndex = index
  //     return instance
  //   })

  //   console.log('curfews', curfews)
  //   return curfews
  // })
  // @ValidateNested({ each: true })
  // @Type(() => CurfewTimeRange)
  // @IsArray()
  // curfews: CurfewTimeRange[]

  @Expose()
  @Transform(({ obj, value }) => {
    const numberOfCurfews = parseInt(obj.numberOfCurfews, 10)
    const selected = value[numberOfCurfews - 1] ?? []

    const curfews: CurfewTimeRange[] = selected.map((timeValue: CurfewTimeRange, index: number) => {
      const instance = new CurfewTimeRange()
      instance.start = timeValue.start
      instance.end = timeValue.end
      instance.curfewIndex = numberOfCurfews
      instance.slotIndex = index
      return instance
    })

    console.log('curfews', curfews)
    return curfews
  })
  @ValidateNested({ each: true })
  @Type(() => CurfewTimeRange)
  @IsArray()
  curfews: CurfewTimeRange[]

  @Expose()
  @IsNotEmpty({ message: 'Select a review period' })
  reviewPeriod: string

  @Expose()
  @Transform(({ obj, value }) => {
    return obj.reviewPeriod === 'Other' ? value : undefined
  })
  @ValidateIf(o => o.reviewPeriod === 'Other')
  @IsNotEmpty({ message: 'Enter a review period' })
  alternativeReviewPeriod: string
}

export default CurfewTerms
