import { Controller, Get } from "@nestjs/common";

import { FlightService } from "./flight.service";

@Controller('flights')
export class FlightController {
    constructor(private readonly flightService: FlightService) {}
    
    @Get()
    async getFlights(){
        const flight_sources =
        [
            'https://coding-challenge.powerus.de/flight/source1',
            'https://coding-challenge.powerus.de/flight/source2'
        ];
        return this.flightService.getFlights(flight_sources);
    }
}