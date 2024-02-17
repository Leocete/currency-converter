import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCurrencyPairException extends HttpException {
  constructor(source: number, target: number) {
    super(
      `Invalid source or target currency codes, Source currency code: ${source}, Target currency code: ${target}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class FetchExchangeRatesException extends HttpException {
  constructor(message: string) {
    super(
      `Failed to fetch exchange rates - ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
