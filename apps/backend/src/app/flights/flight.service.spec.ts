import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { FlightService } from './flight.service';
import { of, throwError, delay } from 'rxjs';
import { AxiosResponse } from 'axios';

const flights = [{ id: 1 }, { id: 2 }, { id: 3 }];


describe('FlightService', () => {
  let service: FlightService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        FlightService,
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            get: jest.fn(),
            set: jest.fn(),
            reset: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<FlightService>(FlightService);
    cacheManager = module.get<jest.Mocked<Cache>>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.resetAllMocks();
    cacheManager.reset();
  });

  describe('getFlights', () => {
    it('should return cached flights if available', async () => {
      const cachedFlights = [{ id: 1 }];
      cacheManager.get.mockImplementationOnce(() => Promise.resolve(cachedFlights));
      const flights = await service.getFlights();
      expect(flights).toEqual({ flights: cachedFlights });
      expect(cacheManager.get).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
    it('should fetch flights from sources, remove duplicates, and cache them', async () => {

        const flight1 = [{ id: 1 }];
        const flight2 = [{ id: 2 }];

        jest.spyOn(service['httpService'], 'get').mockReturnValueOnce(of({ data: { flights: flight1 } } as AxiosResponse)).mockReturnValueOnce(of({ data: { flights: flight2 } } as AxiosResponse));
        const mergedFlights = [...flight1, ...flight2];
        const uniqueFlights = [{ id: 1 }, { id: 2 }];
        cacheManager.get.mockImplementationOnce(() => Promise.resolve(null));
        jest.spyOn(service, 'removeDuplicates').mockReturnValueOnce(uniqueFlights);
    
        const flights = await service.getFlights();
        expect(flights).toEqual({ flights: uniqueFlights });
        expect(cacheManager.get).toHaveBeenCalledTimes(1);
        expect(cacheManager.set).toHaveBeenCalledTimes(1);
        expect(cacheManager.set).toHaveBeenCalledWith('flights', uniqueFlights);
        expect(service.removeDuplicates).toHaveBeenCalledTimes(1);
        expect(service.removeDuplicates).toHaveBeenCalledWith(mergedFlights);
        expect(service['httpService'].get).toHaveBeenCalledTimes(2);
      });
    it('should return data from working source even if one of the sources fails under 1 sec', async () => {
        const flight1 = [{ id: 1 }];
        const flight2 = [{ id: 2 }];
        const mergedFlights = [...flight1];
        const uniqueFlights = [{ id: 1 }];
        cacheManager.get.mockImplementationOnce(() => Promise.resolve(null));
        jest.spyOn(service, 'removeDuplicates').mockReturnValueOnce(uniqueFlights);
        jest.spyOn(service['httpService'], 'get').mockReturnValueOnce(of({ data: { flights: flight1 } } as AxiosResponse)).mockReturnValueOnce(throwError(()=>'error'));
        const flights = await service.getFlights();
        expect(flights).toEqual({ flights: uniqueFlights });
        expect(cacheManager.get).toHaveBeenCalledTimes(1);
        expect(cacheManager.set).toHaveBeenCalledTimes(0);
        expect(service.removeDuplicates).toHaveBeenCalledTimes(1);
        expect(service.removeDuplicates).toHaveBeenCalledWith(mergedFlights);
        expect(service['httpService'].get).toHaveBeenCalledTimes(2);
    },1000);
    it('should respond with available data under 1 sec if any source takes too long', async () => {
        const flight1 = [{ id: 1 }];
        const flight2 = [{ id: 2 }];
        const mergedFlights = [...flight1];
        const uniqueFlights = [{ id: 1 }];
        cacheManager.get.mockImplementationOnce(() => Promise.resolve(null));
        jest.spyOn(service, 'removeDuplicates').mockReturnValueOnce(uniqueFlights);
        jest.spyOn(service['httpService'], 'get').mockReturnValueOnce(of({ data: { flights: flight1 } } as AxiosResponse)).mockReturnValueOnce(of({ data: { flights: flight2 } } as AxiosResponse).pipe(delay(5000)));
        const flights = await service.getFlights();
        expect(flights).toEqual({ flights: uniqueFlights });
        expect(cacheManager.get).toHaveBeenCalledTimes(1);
        expect(cacheManager.set).toHaveBeenCalledTimes(0);
        expect(service.removeDuplicates).toHaveBeenCalledTimes(1);
        expect(service.removeDuplicates).toHaveBeenCalledWith(mergedFlights);
        expect(service['httpService'].get).toHaveBeenCalledTimes(2);
    }, 1000);
    it('should respond with empty array under 1 sec if all sources fail', async () => {
        cacheManager.get.mockImplementationOnce(() => Promise.resolve(null));
        jest.spyOn(service['httpService'], 'get').mockReturnValueOnce(throwError(()=>'error')).mockReturnValueOnce(throwError(()=>'error'));
        const flights = await service.getFlights();
        expect(flights).toEqual({ flights: [] });
        expect(cacheManager.get).toHaveBeenCalledTimes(1);
        expect(cacheManager.set).toHaveBeenCalledTimes(0);
        expect(service['httpService'].get).toHaveBeenCalledTimes(2);
    }, 1000);
});
  
});

   