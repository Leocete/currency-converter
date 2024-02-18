import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('CurrencyService', () => {
  let currencyService: CurrencyService;
  let httpService: HttpService;
  let cacheManager: Cache;
  let configService: ConfigService;
  const mockExchangeRates = [
    {
      currencyCodeA: 840,
      currencyCodeB: 980,
      date: 1708096806,
      rateBuy: 37.9,
      rateSell: 38.2995,
    },
    {
      currencyCodeA: 826,
      currencyCodeB: 980,
      date: 1708098119,
      rateCross: 48.258,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule],
      providers: [
        CurrencyService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => 'any value',
            set: () => jest.fn(),
          },
        },
      ],
    }).compile();

    currencyService = module.get<CurrencyService>(CurrencyService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);

    configService.get = jest.fn().mockReturnValue('any value');
  });

  it('should be defined', () => {
    expect(currencyService).toBeDefined();
  });

  describe('fetchExchangeRates', () => {
    it('should return exchange rates from Monobank API', async () => {
      cacheManager.get = jest.fn().mockReturnValue(null);
      httpService.axiosRef.get = jest
        .fn()
        .mockResolvedValueOnce({ data: mockExchangeRates });

      const exchangeRates = await currencyService.fetchExchangeRates();

      expect(cacheManager.get).toHaveBeenCalledTimes(1);
      expect(configService.get).toHaveBeenCalledTimes(3);
      expect(httpService.axiosRef.get).toHaveBeenCalledTimes(1);
      expect(exchangeRates).toEqual(mockExchangeRates);
    });

    it('should return exchange rates from cache', async () => {
      cacheManager.get = jest.fn().mockReturnValue(mockExchangeRates);
      httpService.axiosRef.get = jest.fn();

      const exchangeRates = await currencyService.fetchExchangeRates();

      expect(cacheManager.get).toHaveBeenCalledTimes(1);
      expect(configService.get).toHaveBeenCalledTimes(3);
      expect(httpService.axiosRef.get).toHaveBeenCalledTimes(0);
      expect(exchangeRates).toEqual(mockExchangeRates);
    });

    it('should throw an error if fetch throws error', async () => {
      cacheManager.get = jest.fn().mockReturnValue(null);
      httpService.axiosRef.get = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      try {
        await currencyService.fetchExchangeRates();
      } catch (error) {
        expect(error.message).toEqual(
          'Failed to fetch exchange rates - API error',
        );
      }
    });

    it('should throw an error if fetch throws error', async () => {
      cacheManager.get = jest.fn().mockReturnValue(null);
      httpService.axiosRef.get = jest.fn().mockReturnValue({});

      try {
        await currencyService.fetchExchangeRates();
      } catch (error) {
        expect(error.message).toEqual(
          'Failed to fetch exchange rates - Unexpected response from Monobank',
        );
      }
    });
  });

  describe('getCurrencyPairExchangeRate', () => {
    it('should return currency pair exchange rate', async () => {
      currencyService.fetchExchangeRates = jest
        .fn()
        .mockReturnValue(mockExchangeRates);

      const currencyPairExchangeRate =
        await currencyService.getCurrencyPairExchangeRate(840, 980);

      expect(currencyPairExchangeRate).toEqual(mockExchangeRates[0]);
    });

    it('should throw an error', async () => {
      currencyService.fetchExchangeRates = jest
        .fn()
        .mockReturnValue(mockExchangeRates);

      try {
        await currencyService.getCurrencyPairExchangeRate(1, 2);
      } catch (error) {
        expect(error.message).toEqual(
          'Invalid source or target currency codes, Source currency code: 1, Target currency code: 2',
        );
      }
    });
  });

  describe('convertCurrency', () => {
    it('should return converted currency and use rateSell division if source code goes FIRST', async () => {
      currencyService.getCurrencyPairExchangeRate = jest
        .fn()
        .mockReturnValue(mockExchangeRates[0]);

      const convertedCurrency = await currencyService.convertCurrency({
        source: 840,
        target: 980,
        amount: 100,
      });

      expect(convertedCurrency).toEqual(2.6110001436050077); // amount / rateSell
    });

    it('should return converted currency and use rateBuy multiplication if source code goes SECOND', async () => {
      currencyService.getCurrencyPairExchangeRate = jest
        .fn()
        .mockReturnValue(mockExchangeRates[0]);

      const convertedCurrency = await currencyService.convertCurrency({
        source: 980,
        target: 840,
        amount: 100,
      });

      expect(convertedCurrency).toEqual(3790); // amount * rateBuy
    });

    it('should return converted currency and use rateCross division if source code goes FIRST', async () => {
      currencyService.getCurrencyPairExchangeRate = jest
        .fn()
        .mockReturnValue(mockExchangeRates[1]);

      const convertedCurrency = await currencyService.convertCurrency({
        source: 826,
        target: 980,
        amount: 100,
      });

      expect(convertedCurrency).toEqual(2.0721952836835342); // amount / rateCross
    });

    it('should return converted currency and use rateCross multiplication if source code goes FIRST', async () => {
      currencyService.getCurrencyPairExchangeRate = jest
        .fn()
        .mockReturnValue(mockExchangeRates[1]);

      const convertedCurrency = await currencyService.convertCurrency({
        source: 980,
        target: 826,
        amount: 100,
      });

      expect(convertedCurrency).toEqual(4825.8); // amount * rateCross
    });
  });
});
