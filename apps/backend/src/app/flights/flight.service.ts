import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, retry } from 'rxjs';

@Injectable()
export class FlightService {

    constructor(private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    flight_sources =
    [
        'https://coding-challenge.powerus.de/flight/source1',
        'https://coding-challenge.powerus.de/flight/source2'
    ];
    
    async getFlights(){
        const cachedFlights = await this.cacheManager.get('flights');
        if (cachedFlights) {
            return {"flights" : cachedFlights};
        }
        const flightsMap = {};
        const flights = [];
        for (const source of this.flight_sources) {
            try{
            const flight_source  = await firstValueFrom(this.httpService.get(source).pipe(retry(3), catchError(err => {throw err})));
            for (const flight of flight_source.data.flights) {
                const flightKey = flight.slices[0].flight_number + flight.slices[0].departure_date_time_utc;
                const flightValue = flight.slices[1].flight_number + flight.slices[1].departure_date_time_utc;
                if (!flightsMap[flightKey] || flightsMap[flightKey] != flightValue){
                    flightsMap[flightKey] = flightValue;
                    flights.push(flight);
                }
            }
            }
            catch (error) {
                console.log(error);
            }
            
        }
        await this.cacheManager.set('flights', flights);
        return {"flights" : flights};  
    }
}