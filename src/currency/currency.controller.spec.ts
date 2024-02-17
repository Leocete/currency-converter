import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { CurrencyConvertDto } from './dto/currency-convert.dto';
import { ConfigModule } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';

describe('CurrencyController', () => {
  let currencyController: CurrencyController;
  let currencyService: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule],
      controllers: [CurrencyController],
      providers: [
        CurrencyService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => 'cached value',
            set: () => jest.fn(),
          },
        },
      ],
    }).compile();

    currencyController = module.get<CurrencyController>(CurrencyController);
    currencyService = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(currencyController).toBeDefined();
  });

  describe('convertCurrency', () => {
    it('should convert currency and return the result', async () => {
      const mockCurrencyConvertDto: CurrencyConvertDto = {
        source: 980,
        target: 840,
        amount: 100,
      };
      const mockResult = 3790;

      currencyService.convertCurrency = jest
        .fn()
        .mockResolvedValueOnce(mockResult);

      const result = await currencyController.convertCurrency(
        mockCurrencyConvertDto,
      );

      expect(result).toEqual(mockResult);
      expect(currencyService.convertCurrency).toHaveBeenCalledWith(
        mockCurrencyConvertDto,
      );
      expect(currencyService.convertCurrency).toHaveBeenCalledTimes(1);
    });
  });
});
