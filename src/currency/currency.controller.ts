import { Controller, Post, Body } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyConvertDto } from './dto/currency-convert.dto';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  async convertCurrency(
    @Body() currencyConvertDto: CurrencyConvertDto,
  ): Promise<number> {
    return await this.currencyService.convertCurrency(currencyConvertDto);
  }
}
