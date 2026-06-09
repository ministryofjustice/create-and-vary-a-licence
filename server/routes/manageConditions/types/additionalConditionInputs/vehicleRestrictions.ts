import { Expose, Transform, Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, Validate, ValidateIf } from 'class-validator'
import { SimpleTime } from '../index'
import ValidSimpleTime from '../../../../validators/simpleTimeValidator'

class VehicleRestrictions {
  @Expose()
  @IsNotEmpty({ message: 'Select a vehicle type' })
  vehicleTypes: string

  @Expose()
  @Transform(({ obj, value }) => {
    return obj.vehicleTypes === 'Types of motor vehicle' ? value : undefined
  })
  @ValidateIf(o => o.vehicleTypes === 'Types of motor vehicle')
  @IsNotEmpty({ message: 'Enter at least one type of vehicle' })
  typesOfMotorVehicle: string

  @Expose()
  @IsNotEmpty({ message: 'Time restriction' })
  timeRestriction: string

  @Expose()
  @Type(() => SimpleTime)
  @ValidateIf(o => o.timeRestriction === 'Between specified times')
  @Validate(ValidSimpleTime)
  firstCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @ValidateIf(o => o.timeRestriction === 'Between specified times')
  @Validate(ValidSimpleTime)
  firstCurfewEnd: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @ValidateIf(
    o =>
      o.timeRestriction === 'Between specified times' &&
      (!SimpleTime.isEmptySimpleTime(o.secondCurfewStart) || !SimpleTime.isEmptySimpleTime(o.secondCurfewEnd)),
  )
  @Validate(ValidSimpleTime)
  secondCurfewStart: SimpleTime

  @Expose()
  @Type(() => SimpleTime)
  @IsOptional()
  @ValidateIf(
    o =>
      o.timeRestriction === 'Between specified times' &&
      (!SimpleTime.isEmptySimpleTime(o.secondCurfewEnd) || !SimpleTime.isEmptySimpleTime(o.secondCurfewStart)),
  )
  @Validate(ValidSimpleTime)
  secondCurfewEnd: SimpleTime

  @Expose()
  @IsNotEmpty({ message: 'Select a location restriction' })
  locationRestriction: string

  @Expose()
  @Transform(({ obj, value }) => {
    return obj.locationRestriction === 'In specified locations' ? value : undefined
  })
  @ValidateIf(o => o.eventType === 'In specified locations')
  @IsNotEmpty({ message: 'Enter at least one location' })
  locations: string
}

export default VehicleRestrictions
