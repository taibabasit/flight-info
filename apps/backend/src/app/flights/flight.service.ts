import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlightService {

    constructor(private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async getFlights() {
        const cachedFlights = await this.cacheManager.get('flights');
        if (cachedFlights) {
            return {"flights" : cachedFlights};
        }
   
        const flightsMap = {};
        const flights = [];
        const flight1 = await firstValueFrom(this.httpService.get('https://coding-challenge.powerus.de/flight/source1'));
        
        const flight2 = await firstValueFrom(this.httpService.get('https://coding-challenge.powerus.de/flight/source2'));
        for (const flight of flight1.data.flights) {
            const flightKey = flight.slices[0].flight_number + flight.slices[0].departure_date_time_utc;
            const flightValue = flight.slices[1].flight_number + flight.slices[1].departure_date_time_utc;
            if (!flightsMap[flightKey] || flightsMap[flightKey] != flightValue){
                flightsMap[flightKey] = flightValue;
                flights.push(flight);
            }
        }

        for (const flight of flight2.data.flights) {
            const flightKey = flight.slices[0].flight_number + flight.slices[0].departure_date_time_utc;
            const flightValue = flight.slices[1].flight_number + flight.slices[1].departure_date_time_utc;
            if (!flightsMap[flightKey] || flightsMap[flightKey] != flightValue){
                flightsMap[flightKey] = flightValue;
                flights.push(flight);
            }
        }
        
        await this.cacheManager.set('flights', flights);
        return {"flights" : flights};    
    }  
      
}