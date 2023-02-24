import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom, retry, timeout } from 'rxjs';

@Injectable()
export class FlightService {

    constructor(private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    // This function removes duplicate flights from the list of flights
    removeDuplicates(flights) {
        const flightsMap = {};
        const unique_flights = [];
        for (const flight of flights) {
            const flightKey = flight.slices[0].flight_number + flight.slices[0].departure_date_time_utc;
            const flightValue = flight.slices[1].flight_number + flight.slices[1].departure_date_time_utc;
            if (!flightsMap[flightKey] || flightsMap[flightKey] != flightValue){
                flightsMap[flightKey] = flightValue;
                unique_flights.push(flight);
            }
        }
        return unique_flights;
    }
    
    // This function returns the list of flights from the cache if it exists, else it fetches the flights from the flight sources, 
    // removes the duplicates and stores it in the cache
    async getFlights(flight_sources){
        const cachedFlights = await this.cacheManager.get('flights');
        if (cachedFlights) {
            return {"flights" : cachedFlights};
        }
        const all_flights = [];
        let flag = true;
        for (const source of flight_sources) {
            try
            {
            const flight_source  = await firstValueFrom(this.httpService.get(source).pipe(timeout(700)));
            all_flights.push(...flight_source.data.flights);
            }
            catch (error) {
                flag = false;
                console.log("Error in fetching flights from source: " + source);
            }
            
        }
        const flights = this.removeDuplicates(all_flights);
        if (flag){
            await this.cacheManager.set('flights', flights);
        }
        return {"flights" : flights};  
    }
}