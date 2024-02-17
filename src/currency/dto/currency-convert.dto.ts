import { IsNumber, IsDefined } from 'class-validator';

export class CurrencyConvertDto {
  @IsDefined()
  @IsNumber()
  readonly source: number;

  @IsDefined()
  @IsNumber()
  readonly target: number;

  @IsDefined()
  @IsNumber()
  readonly amount: number;
}
