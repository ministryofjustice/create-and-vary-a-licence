import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export default class RegionCode {
  @Expose()
  @IsNotEmpty({ message: 'Select a probation region' })
  regionCode: string
}