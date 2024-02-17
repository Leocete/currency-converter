import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CurrencyConvertDto } from './dto/currency-convert.dto';
import { ConfigService } from '@nestjs/config';
import {
  FetchExchangeRatesException,
  InvalidCurrencyPairException,
} from './errors/currency.exceptions';

interface ICurrencyPairExchangeRate {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
}

@Injectable()
export class CurrencyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Fetches the exchange rates from the Monobank API or cache if available.
   * @returns An array of exchange rates.
   * @throws An error if the request to the Monobank API fails or if the response structure is unexpected. (TODO)
   */
  async fetchExchangeRates(): Promise<ICurrencyPairExchangeRate[]> {
    try {
      const apiUrl = this.configService.get<string>('MONOBANK_API_URL');
      const ttl = this.configService.get<number>('MONOBANK_API_TTL');
      const cacheKey = this.configService.get<string>(
        'MONOBANK_EXCHANGE_RATES_CACHE_KEY',
      );

      const cachedExchangeRates =
        await this.cacheManager.get<ICurrencyPairExchangeRate[]>(cacheKey);

      if (cachedExchangeRates) {
        return cachedExchangeRates;
      }

      // Used traditional axios approach, alternatively, you can use the Observable approach (firstValueFrom + pipe + catchError)
      // TODO: we could also add Monobank API response validation here, and throw an error if the response structure is not as expected
      const { data } = await this.httpService.axiosRef.get(apiUrl);
      await this.cacheManager.set(cacheKey, data, ttl);

      return data;
    } catch (error) {
      console.error(error);
      throw new FetchExchangeRatesException(error.message);
    }
  }

  /**
   * Retrieves the exchange rate for a specified currency pair from the fetched exchange rates.
   * @param source - The source currency code.
   * @param target - The target currency code.
   * @returns The exchange rate details for the specified currency pair.
   * @throws An error if the specified currency pair is invalid or not found in the fetched exchange rates.
   */
  async getCurrencyPairExchangeRate(
    source: number,
    target: number,
  ): Promise<ICurrencyPairExchangeRate> {
    const exchangeRates = await this.fetchExchangeRates();
    const currencyPairExchangeRate = exchangeRates.find(
      (rate) =>
        (rate.currencyCodeA === source && rate.currencyCodeB === target) ||
        (rate.currencyCodeA === target && rate.currencyCodeB === source),
    );

    if (!currencyPairExchangeRate) {
      throw new InvalidCurrencyPairException(source, target);
    }
    return currencyPairExchangeRate;
  }

  /**
   * Converts the specified amount from the source currency to the target currency based on the exchange rates.
   * @param currencyConvertDto - The DTO containing source, target, and amount details.
   * @returns The converted currency amount.
   * @throws An error if the exchange rate details cannot be retrieved or if the conversion fails.
   */
  async convertCurrency({
    source,
    target,
    amount,
  }: CurrencyConvertDto): Promise<number> {
    const { currencyCodeA, rateBuy, rateSell, rateCross } =
      await this.getCurrencyPairExchangeRate(source, target);

    if (rateCross) {
      return source === currencyCodeA ? amount / rateCross : amount * rateCross;
    } else {
      return source === currencyCodeA ? amount / rateSell : amount * rateBuy;
    }
  }
}
